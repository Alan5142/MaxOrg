using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Hubs.Clients;
using MaxOrg.Models;
using MaxOrg.Models.Calendar;
using MaxOrg.Models.Group;
using MaxOrg.Models.Kanban;
using MaxOrg.Models.Tasks;
using MaxOrg.Models.Tests;
using MaxOrg.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Octokit;
using shortid;
using Notification = MaxOrg.Models.Notification;
using User = MaxOrg.Models.Users.User;

namespace MaxOrg.Controllers
{
    /// <summary>
    /// Se encarga de administrar todos las peticiones HTTP que involucren a los grupos de trabajo
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        /// <summary>
        /// Referencia a una conexión a la base de datos, es construida por ASP.NET Core e inyectada dentro de la clase
        /// </summary>
        private IArangoDatabase Database { get; }

        /// <summary>
        /// Referencia a "KanbanHub", el cual es un "Hub" de SignalR, este hub maneja la conexión
        /// en tiempo real con los clientes que esten observando un tablero Kanban, es inyectado por ASP.NET Core
        /// </summary>
        private IHubContext<KanbanHub, IKanbanClient> KanbanHub { get; }

        /// <summary>
        /// Referencia a "NotificationHub", el cual es un "Hub" de SignalR, este hub maneja la conexión
        /// con los clientes para enviarles notificaciones en tiempo real, es inyectado a la clase por ASP.NET Core
        /// </summary>
        private IHubContext<NotificationHub> NotificationHub { get; }

        /// <summary>
        /// Parametros de configuración de la aplicación, es inyectado por ASP.NET Core
        /// </summary>
        private IConfiguration Configuration { get; }

        private CloudBlobContainer BlobContainer { get; }

        private HttpClient HttpClient { get; }

        /// <summary>
        /// Constructor de la clase, es invocado por ASP.NET Core al momento de tener que manejar una petición, al mismo tiempo
        /// le inyecta la base de datos, el "Hub" para el tablero, el "Hub" para las notificaciones y los parametros de
        /// configuración de la aplicación 
        /// </summary>
        /// <param name="database"></param>
        /// <param name="kanbanHub"></param>
        /// <param name="notificationHub"></param>
        /// <param name="configuration"></param>
        /// <param name="container"></param>
        public GroupsController(IArangoDatabase database,
            IHubContext<KanbanHub, IKanbanClient> kanbanHub,
            IHubContext<NotificationHub> notificationHub,
            IConfiguration configuration,
            CloudBlobContainer container,
            HttpClient client)
        {
            HttpClient = client;
            BlobContainer = container;
            Configuration = configuration;
            KanbanHub = kanbanHub;
            Database = database;
            NotificationHub = notificationHub;
        }

        /// <summary>
        /// Crea un grupo dentro de un grupo o un proyecto, es invocado por SignalR
        /// </summary>
        /// <param name="createGroup">Información requerida para poder crear el grupo</param>
        /// <returns>
        /// BadRequest si algún parametro ingresado por el usuario junto con un mensaje de descripción
        /// Created junto con la dirección del recurso si se creo exitosamente
        /// </returns>
        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest createGroup)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var currentDate = DateTime.UtcNow;

                // El usuario no es administrador del grupo que se planea hacer un subgrupo
                if (!await IsAdmin(createGroup.CurrentGroupId))
                {
                    return Unauthorized();
                }

                // Subgroup admin doesn't exist
                var subgroupAdmin = await db.Query<User>().Where(u => u.Key == createGroup.SubgroupAdminId)
                    .FirstOrDefaultAsync();
                if (subgroupAdmin == null)
                {
                    return BadRequest(new {message = "Invalid subgroup admin"});
                }

                var groupGraph = db.Graph("GroupUsersGraph");

                var usersToAdd = from u in db.Query<User>()
                    from ud in createGroup.Members
                    where u.Username == ud
                    select u;

                var newGroup = new Group
                {
                    CreationDate = currentDate,
                    Name = createGroup.Name,
                    GroupOwner = createGroup.SubgroupAdminId,
                    IsRoot = false,
                    Description = createGroup.Description
                };

                var createdGroup = await db.InsertAsync<Group>(newGroup);

                var currentUser = await (from u in db.Query<User>()
                    where u.Key == HttpContext.User.Identity.Name
                    select u).FirstOrDefaultAsync();

                var currentGroup = await (from g in db.Query<Group>()
                    where g.Key == createGroup.CurrentGroupId
                    select g).FirstOrDefaultAsync();
                var subgroup = new Subgroup
                {
                    Parent = currentGroup.Id,
                    Child = createdGroup.Id
                };
                var subgroupGraph = db.Graph("SubgroupGraph");
                await subgroupGraph.InsertEdgeAsync<Subgroup>(subgroup);

                var admin = new UsersInGroup
                {
                    IsAdmin = true,
                    JoinDate = currentDate,
                    Group = createdGroup.Id,
                    User = "User/" + subgroupAdmin.Key,
                    AddedBy = currentUser.Key
                };
                await groupGraph.InsertEdgeAsync<UsersInGroup>(admin);

                usersToAdd = usersToAdd.Where(u => u.Key != subgroupAdmin.Key).Select(u => u);

                var root = await Database.GetRootGroup(createdGroup.Key);

                foreach (var user in usersToAdd)
                {
                    var userToAdd = new UsersInGroup
                    {
                        IsAdmin = false,
                        JoinDate = currentDate,
                        Group = createdGroup.Id,
                        User = user.Id,
                        AddedBy = subgroupAdmin.Key
                    };
                    await groupGraph.InsertEdgeAsync<UsersInGroup>(userToAdd);
                    userToAdd = new UsersInGroup
                    {
                        IsAdmin = false,
                        JoinDate = currentDate,
                        Group = root.Id,
                        User = user.Id,
                        AddedBy = subgroupAdmin.Key
                    };
                    try
                    {
                        await groupGraph.InsertEdgeAsync<UsersInGroup>(userToAdd);
                    }
                    catch (Exception e)
                    {
                        // ignored
                    }
                }

                return Created("api/groups/" + createdGroup.Key, null);
            }
        }

        /// <summary>
        /// Modifica la información de un proyecto, solo se le permite al administrador del grupo o a los
        /// administradores de jerarquía superior, este método es invocado por ASP.NET Core e invoca a "IsAdmin"
        /// de la clase IArangoDatabase, el cuál es un extension method, devuelve un código de error 404 en caso de que
        /// no exista el grupo, un 401 en caso de que no este autorizado y un 200 en caso de que se haya modificado con exito
        /// la información del grupo
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="editGroupData"></param>
        /// <returns></returns>
        [HttpPut("{groupId}")]
        public async Task<IActionResult> EditGroup(string groupId, [FromBody] EditGroupRequest editGroupData)
        {
            var group = await Database.DocumentAsync<Group>(groupId);
            if (group == null)
            {
                return NotFound();
            }

            if (!await Database.IsAdmin(HttpContext.User.Identity.Name, groupId))
            {
                return Unauthorized();
            }

            group.Name = editGroupData.Name ?? group.Name;
            group.LinkedRepositoryName = editGroupData.LinkedRepositoryName ?? group.LinkedRepositoryName;
            group.GroupOwner = editGroupData.GroupOwner ?? group.GroupOwner;
            group.Description = editGroupData.Description ?? group.Description;

            await Database.UpdateByIdAsync<Group>(group.Id, group);
            return Ok();
        }

        /// <summary>
        /// Cambia la descripción del grupo
        /// </summary>
        /// <param name="groupId">Grupo al que se desea cambiar la descripción</param> 
        /// <param name="newDescription">Nueva descripción</param>
        /// <returns>404 si no se encuentra el recurso, 401 si no es admin, 200 si se cambio con exito</returns>
        [HttpPost("{groupId}/description")]
        public async Task<IActionResult> ChangeGroupDescription(string groupId,
            [FromBody] ChangeGroupDescriptionRequest newDescription)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var group = await GetGroup(groupId);
                if (group == null)
                {
                    return NotFound();
                }

                if (!await IsAdmin(groupId))
                {
                    return Unauthorized();
                }

                group.Description = newDescription.NewDescription;
                await db.UpdateByIdAsync<Group>(group.Id, group);
            }

            return Ok();
        }

        [HttpGet("{groupId}/description")]
        public async Task<IActionResult> GetGroupDescription(string groupId)
        {
            var group = await GetGroup(groupId);
            if (group == null)
            {
                return NotFound();
            }

            if (GetGroupMembers(groupId).Find(u => u.Key == HttpContext.User.Identity.Name) == null &&
                !await IsAdmin(groupId))
            {
                // the user is not in the group
                return Unauthorized();
            }

            return Ok(new {@group.Description});
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupInfo(string groupId)
        {
            var db = Database;
            var group = await (from g in db.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var members = GetGroupMembers(groupId).Select(u => new {u.Key, u.Username, u.Email});

            string repoUrl = null;
            var root = await Database.GetRootGroup(groupId);
            if (root.LinkedRepositoryName.HasValue)
            {
                var admin = await Database.DocumentAsync<User>(root.GroupOwner);
                var client = new GitHubClient(new ProductHeaderValue("maxorg"));

                var tokenAuth = new Credentials(admin.GithubToken);
                client.Credentials = tokenAuth;

                var repo = await client.Repository.Get(root.LinkedRepositoryName.Value);
                repoUrl = repo.HtmlUrl;
            }

            return Ok(new
            {
                @group.Name,
                @group.Key,
                @group.GroupOwner,
                @group.CreationDate,
                @group.Description,
                members,
                repoUrl
            });
        }

        [HttpGet("{groupId}/members")]
        public async Task<IActionResult> GetMembersOfGroup(string groupId)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var members = GetGroupMembers(groupId).Select(u => new
            {
                u.Key,
                u.Username,
                ProfilePicture = $"{Configuration["AppSettings:DefaultURL"]}/api/users/{u.Key}/profile.jpeg"
            }).ToList();

            var isMemberOfGroup = members.Find(u => u.Key == HttpContext.User.Identity.Name) != null;
            if (!isMemberOfGroup && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            return Ok(new {Members = members});
        }

        #region Calendar events

        [HttpGet("{groupId}/calendar")]
        public async Task<IActionResult> GetGroupEvents(string groupId)
        {
            var rootGroup = await Database.GetRootGroup(groupId);
            if (rootGroup == null)
            {
                return NotFound();
            }

            var userId = HttpContext.User.Identity.Name;

            if (!await Database.IsGroupMember(userId, rootGroup.Key))
            {
                return Unauthorized();
            }

            var isAdmin = await Database.IsAdmin(userId, groupId);

            return Ok(rootGroup.Events.Select(e => new
            {
                e.Id,
                e.Title,
                e.Color,
                e.End,
                e.Meta,
                e.Resizable,
                e.Start,
                e.AllDay,
                CanEdit = isAdmin || e.Creator == userId
            }));
        }

        [HttpPost("{groupId}/calendar")]
        public async Task<IActionResult> CreateEvent(string groupId, [FromBody] CalendarEvent eventRequest)
        {
            var rootGroup = await Database.GetRootGroup(groupId);
            if (rootGroup == null)
            {
                return NotFound();
            }

            if (!await Database.IsGroupMember(HttpContext.User.Identity.Name, rootGroup.Key))
            {
                return Unauthorized();
            }

            rootGroup.Events.Add(new CalendarEvent
            {
                Description = eventRequest.Description,
                Title = eventRequest.Title,
                Color = eventRequest.Color,
                Creator = HttpContext.User.Identity.Name,
                End = eventRequest.End,
                Meta = eventRequest.Meta,
                Resizable = eventRequest.Resizable,
                Start = eventRequest.Start,
                AllDay = eventRequest.AllDay
            });

            await Database.UpdateByIdAsync<Group>(rootGroup.Id, rootGroup);
            return Ok();
        }

        [HttpPut("{groupId}/calendar/{eventId}")]
        public async Task<IActionResult> EditEvent(string groupId, string eventId,
            [FromBody] CalendarEvent eventRequest)
        {
            var rootGroup = await Database.GetRootGroup(groupId);
            if (rootGroup == null)
            {
                return NotFound();
            }

            if (!await Database.IsGroupMember(HttpContext.User.Identity.Name, rootGroup.Key))
            {
                return Unauthorized();
            }

            var ev = rootGroup.Events.Find(e => e.Id == eventId);
            if (ev == null || ev?.Creator != HttpContext.User.Identity.Name ||
                !await Database.IsAdmin(HttpContext.User.Identity.Name, groupId))
            {
                return NotFound();
            }

            ev.Color = eventRequest.Color ?? ev.Color;
            ev.Description = eventRequest.Description ?? ev.Description;
            ev.Title = eventRequest.Title ?? ev.Title;
            ev.End = eventRequest.End;
            ev.Meta = eventRequest.Meta;
            ev.Resizable = eventRequest.Resizable;
            ev.Start = eventRequest.Start;
            ev.AllDay = eventRequest.AllDay;
            await Database.UpdateByIdAsync<Group>(rootGroup.Id, rootGroup);
            return Ok();
        }

        [HttpDelete("{groupId}/calendar/{eventId}")]
        public async Task<IActionResult> DeleteEvent(string groupId, string eventId)
        {
            var rootGroup = await Database.GetRootGroup(groupId);
            if (rootGroup == null)
            {
                return NotFound();
            }

            if (!await Database.IsGroupMember(HttpContext.User.Identity.Name, rootGroup.Key))
            {
                return Unauthorized();
            }

            var ev = rootGroup.Events.Find(e => e.Id == eventId);
            if (ev == null || ev?.Creator != HttpContext.User.Identity.Name ||
                !await Database.IsAdmin(HttpContext.User.Identity.Name, groupId))
            {
                return NotFound();
            }

            rootGroup.Events.Remove(ev);
            await Database.UpdateByIdAsync<Group>(rootGroup.Id, rootGroup);
            return Ok();
        }

        #endregion

        #region Kanban Boards

        [HttpPost("{groupId}/boards")]
        public async Task<IActionResult> CreateBoard(string groupId, [FromBody] CreateKanbanBoardRequest request)
        {
            var db = Database;
            var group = await GetGroup(groupId);
            if (group == null)
            {
                return NotFound();
            }

            group.KanbanBoards.Add(new KanbanBoard(request.Name));
            var createdBoard = @group.KanbanBoards.Last();
            createdBoard.Members.Add(new KanbanGroupMember
            {
                UserId = HttpContext.User.Identity.Name,
                MemberPermissions = KanbanMemberPermissions.Admin
            });
            await db.UpdateByIdAsync<Group>(@group.Id, @group);
            return Created($"./{createdBoard.Id}", createdBoard);
            // return Redirect("api/" + groupId + "boards/" + @group.KanbanBoards.Last().Id, createdBoard);
        }

        [HttpGet("{groupId}/boards")]
        public async Task<IActionResult> GetBoardsOfGroup(string groupId)
        {
            var db = Database;
            var group = await (from g in db.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            IEnumerable<KanbanBoard> kanbanBoards = group.KanbanBoards;
            if (!await IsAdmin(groupId))
            {
                kanbanBoards = from kb in kanbanBoards
                    where kb.Members.Find(km => km.UserId == HttpContext.User.Identity.Name) != null
                    select kb;
            }

            // send only names and ids
            if (kanbanBoards.Count() == 0)
            {
                return Ok(new
                {
                    boards = new List<KanbanBoard>()
                });
            }

            return Ok(new
            {
                boards = from kb in kanbanBoards
                    select new {kb.Name, kb.Id}
            });
        }

        [HttpGet("{groupId}/boards/{boardId}")]
        public async Task<IActionResult> GetBoardWithId(string groupId, string boardId)
        {
            var db = Database;
            var group = await (from g in db.Query<Group>() where g.Key == groupId select g).FirstOrDefaultAsync();
            if (@group == null)
            {
                return NotFound();
            }

            var kanbanBoards = (from kb in @group.KanbanBoards
                where kb.Members.Find(km => km.UserId == HttpContext.User.Identity.Name) != null
                select @group.KanbanBoards).FirstOrDefault();
            if (kanbanBoards == null)
            {
                return NotFound();
            }

            var kanbanBoard = kanbanBoards.Find(kb => kb.Id == boardId);

            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var canEdit =
                kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name)?.MemberPermissions !=
                KanbanMemberPermissions.Read || await IsAdmin(groupId);
            var isAdmin =
                kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name)?.MemberPermissions ==
                KanbanMemberPermissions.Admin || await IsAdmin(groupId);

            var members = kanbanBoard.Members.Select(m => new
            {
                m.MemberPermissions,
                User = db.Query<User>().Where(u => u.Key == m.UserId).Select(u => u).FirstOrDefault()?.Username,
                ProfilePicture = $"{Configuration["AppSettings:DefaultURL"]}/api/users/{m.UserId}/profile.jpeg"
            });

            return Ok(new
            {
                kanbanBoard.CreationDate,
                kanbanBoard.Id,
                kanbanBoard.KanbanGroups,
                Members = members,
                kanbanBoard.Name,
                CanEdit = canEdit,
                IsAdmin = isAdmin
            });
        }

        [HttpPost("{groupId}/boards/{boardId}/members")]
        public async Task<IActionResult> ModifyMembersToBoard(string groupId, string boardId,
            [FromBody] ModifyKanbanMembersRequest request)
        {
            var db = Database;
            var group = await (from g in db.Query<Group>() where g.Key == groupId select g).FirstOrDefaultAsync();
            if (@group == null)
            {
                return NotFound();
            }

            var kanbanBoards = (from kb in @group.KanbanBoards
                where kb.Members.Find(km => km.UserId == HttpContext.User.Identity.Name) != null
                select @group.KanbanBoards).FirstOrDefault();
            if (kanbanBoards == null)
            {
                return NotFound();
            }

            var kanbanBoard = kanbanBoards.Find(kb => kb.Id == boardId);

            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var canEdit =
                kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name).MemberPermissions !=
                KanbanMemberPermissions.Admin || await IsAdmin(groupId);
            if (!canEdit)
            {
                return Unauthorized();
            }

            List<KanbanGroupMember> newMembers = new List<KanbanGroupMember>();

            foreach (var newMember in request.MembersToEdit)
            {
                var user = Database.CreateStatement<User>($@"
                    FOR v in 1 INBOUND 'Group/{groupId}' GRAPH 'GroupUsersGraph' 
                    FILTER v.username == '{newMember.User}' return v").ToList().FirstOrDefault();
                if (user == null)
                {
                    continue;
                }

                var exists = kanbanBoard.Members.Find(m => m.UserId == user.Key);

                if (exists?.MemberPermissions == KanbanMemberPermissions.Admin)
                {
                    newMembers.Add(exists);
                    continue;
                }

                string notificationMessage;

                if (exists != null && exists.MemberPermissions != KanbanMemberPermissions.Admin) // si existe
                {
                    exists.MemberPermissions = newMember.MemberPermissions;
                    notificationMessage = $"Tus permisos han cambiado en el tablero {kanbanBoard.Name}";
                    newMembers.Add(exists);
                }
                else
                {
                    newMembers.Add(new KanbanGroupMember()
                    {
                        MemberPermissions = newMember.MemberPermissions,
                        UserId = user.Key
                    });
                    notificationMessage = $"Fuiste agregado al tablero {kanbanBoard.Name}";
                }

                var notification = new Notification
                {
                    Read = false,
                    Message = notificationMessage,
                    Priority = NotificationPriority.Low,
                    Context = $"project/{groupId}/board/{boardId}"
                };

                user.Notifications.Add(notification);
                await Database.UpdateByIdAsync<User>(user.Id, user);
                await NotificationHub.Clients
                    .Group($"Users/{user.Key}")
                    .SendAsync("notificationReceived", notification);
            }

            kanbanBoard.Members = newMembers;

            await Database.UpdateByIdAsync<Group>(group.Id, group);
            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();
            return Ok();
        }

        [HttpPost("{groupId}/boards/{boardId}/sections")]
        public async Task<IActionResult> CreateSection(string groupId, string boardId,
            [FromBody] CreateSectionRequest request)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            kanbanBoard.KanbanGroups.Add(new KanbanCardSection
            {
                Name = request.Name
            });

            await Database.UpdateByIdAsync<Group>(group.Id, group);

            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();

            return Ok();
        }

        /// <summary>
        /// Crea una tarjeta en determinada sección
        /// </summary>
        /// <param name="groupId">
        /// Identificador
        /// </param>
        /// <param name="boardId"></param>
        /// <param name="sectionId"></param>
        /// <param name="cardInfo"></param>
        /// <returns></returns>
        [HttpPost("{groupId}/boards/{boardId}/sections/{sectionId}/cards")]
        public async Task<IActionResult> CreateCardInSection(string groupId, string boardId, string sectionId,
            [FromBody] CreateKanbanCardInSectionRequest cardInfo)
        {
            var db = Database;
            var group = await (from g in db.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (@group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOr(null);
            if (kanbanSection == null)
            {
                return NotFound();
            }

            var card = new KanbanCard
            {
                Title = cardInfo.Name,
                Description = cardInfo.Description
            };

            kanbanSection.Cards.Add(card);
            await db.UpdateByIdAsync<Group>(@group.Id, @group);

            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();

            return Ok();
        }

        [HttpPut("{groupId}/boards/{boardId}/sections/{sectionId}")]
        public async Task<IActionResult> ModifyKanbanSection(string groupId, string boardId, string sectionId,
            [FromBody] ModifyKanbanSectionRequest request)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOrDefault();

            if (kanbanSection == null)
            {
                return NotFound();
            }

            kanbanSection.Name = request.Name ?? kanbanSection.Name;
            kanbanSection.Color = request.Color ?? kanbanSection.Color;

            await Database.UpdateByIdAsync<Group>(group.Id, group);

            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();

            return Ok();
        }

        [HttpDelete("{groupId}/boards/{boardId}/sections/{sectionId}")]
        public async Task<IActionResult> DeleteSection(string groupId, string boardId, string sectionId)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOrDefault();

            if (kanbanSection == null)
            {
                return NotFound();
            }

            kanbanBoard.KanbanGroups.RemoveAll(ks => ks.Id == sectionId);
            await Database.UpdateByIdAsync<Group>(group.Id, group);

            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();

            return Ok();
        }

        [HttpDelete("{groupId}/boards/{boardId}/sections/{sectionId}/cards/{cardId}")]
        public async Task<IActionResult> DeleteCard(string groupId, string boardId, string sectionId, string cardId)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOrDefault();

            if (kanbanSection == null)
            {
                return NotFound();
            }

            var card = kanbanSection.Cards.Find(c => c.Id == cardId);

            if (card == null)
            {
                return NotFound();
            }

            kanbanSection.Cards.Remove(card);

            foreach (var member in kanbanBoard.Members)
            {
                var user = Database.Query<User>().Where(u => u.Key == member.UserId).Select(u => u).FirstOrDefault();
                if (user == null /* <- nunca debería pasar */ || user?.Key == HttpContext.User.Identity.Name)
                {
                    continue;
                }

                var notificationMessage =
                    string.Format($"Se ha eliminado la tarjeta {card.Title} del grupo {kanbanBoard.Name}");

                var notification = new Notification
                {
                    Read = false,
                    Message = notificationMessage,
                    Priority = NotificationPriority.Low,
                    Context = $"project/{groupId}/board/{boardId}"
                };

                // enviar la notificación
                await NotificationHub.Clients
                    .Group($"Users/{user.Key}")
                    .SendAsync("notificationReceived", notification);


                user.Notifications.Add(notification);
                await Database.UpdateByIdAsync<User>(user.Id, user);
            }

            Database.UpdateById<Group>(group.Id, group);

            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();
            return Ok();
        }

        [HttpPatch("{groupId}/boards/{boardId}/sections/{sectionId}/cards/{cardId}")]
        public async Task<IActionResult> UpdateCard(string groupId, string boardId, string sectionId, string cardId,
            KanbanCard cardNewData)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOrDefault();

            if (kanbanSection == null)
            {
                return NotFound();
            }

            var card = kanbanSection.Cards.Find(c => c.Id == cardId);

            if (card == null)
            {
                return NotFound();
            }

            card.Title = cardNewData.Title ?? card.Title;
            card.Description = cardNewData.Description ?? card.Description;
            card.DetailedDescription = cardNewData.DetailedDescription ?? card.DetailedDescription;
            await Database.UpdateByIdAsync<Group>(group.Id, group);

            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();
            return Ok();
        }

        /// <summary>
        /// Mueve de sección una tarjeta
        /// </summary>
        /// <param name="groupId">
        /// Identificador del grupo en el que se encuentra la tarjeta
        /// </param>
        /// <param name="boardId">
        /// Identificador del tablero en el que se encuentra la tarjeta
        /// </param>
        /// <param name="sectionId">
        /// Identificador de la sección en la que se encuentra la tarjeta
        /// </param>
        /// <param name="cardId">
        /// Identificador de la tarjeta que se desea mover
        /// </param>
        /// <param name="moveKanbanCardRequest">
        /// Parametro que se envía por "body" que contiene el Id de la otra sección
        /// </param>
        /// <returns>
        /// NotFound en caso de que no exista el grupo, el tablero, la sección o la tarjeta, Ok en
        /// caso de que se haya modificado con exito
        /// </returns>
        [HttpPut("{groupId}/boards/{boardId}/sections/{sectionId}/cards/{cardId}")]
        public async Task<IActionResult> MoveCard(string groupId, string boardId, string sectionId, string cardId,
            [FromBody] MoveKanbanCardRequest moveKanbanCardRequest)
        {
            var db = Database;
            // obtenemos el grupo y verificamos si existe
            var group = await (from g in db.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            // obtenemos la sección y verificamos si existe
            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOrDefault();

            if (kanbanSection == null)
            {
                return NotFound();
            }

            // obtenemos la tarjeta
            var kanbanCard = (from kc in kanbanSection.Cards
                where kc.Id == cardId
                select kc).FirstOrDefault();

            if (kanbanCard == null)
            {
                return NotFound();
            }

            // obtenemos la nueva sección
            var newKanbanSection = (from nks in kanbanBoard.KanbanGroups
                where nks.Id == moveKanbanCardRequest.NewSectionId
                select nks).FirstOrDefault();

            if (newKanbanSection == null)
            {
                return NotFound();
            }

            // añadimos la tarjeta a la nueva sección y la eliminamos de la anterior
            newKanbanSection.Cards.Insert(moveKanbanCardRequest.NewIndex, kanbanCard);
            kanbanSection.Cards.Remove(kanbanCard);

            // actualizamos :)
            await db.UpdateByIdAsync<Group>(@group.Id, @group);
            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();
            return Ok();
        }

        [HttpPut("{groupId}/boards/{boardId}/sections/{sectionId}/cards/swap")]
        public async Task<IActionResult> SwapCards(string groupId, string boardId, string sectionId,
            [FromBody] SwapCardsRequest request)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == groupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == boardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name);
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read && !await IsAdmin(groupId))
            {
                return Unauthorized();
            }

            // obtenemos la sección y verificamos si existe
            var kanbanSection = (from ks in kanbanBoard.KanbanGroups
                where ks.Id == sectionId
                select ks).FirstOrDefault();
            if (kanbanSection == null)
            {
                return NotFound();
            }

            var cards = kanbanSection?.Cards;

            if (request.PreviousIndex > cards.Count)
            {
                return BadRequest();
            }

            // Swap
            var item = cards[request.PreviousIndex];
            cards.Remove(item);
            cards.Insert(request.NewIndex, item);

            await Database.UpdateByIdAsync<Group>(group.Id, group);
            await KanbanHub.Clients.Group($"Group/${groupId}/Kanban/${boardId}").UpdateBoard();
            return Ok();
        }

        [HttpGet("{groupId}/admin-info")]
        public async Task<IActionResult> AdminDashboardInfo(string groupId)
        {
            var group = await Database.Collection("Group").DocumentAsync<Group>(groupId);
            if (group == null)
            {
                return NotFound();
            }

            var root = await Database.GetRootGroup(groupId);

            if (!await Database.IsAdmin(HttpContext.User.Identity.Name, groupId))
            {
                return Unauthorized();
            }

            var members = Database.CreateStatement<int>($@"return LENGTH(FOR c in 1..1 INBOUND 'Group/{groupId}'
 GRAPH 'GroupUsersGraph'
 return c)").ToList().FirstOr(0);

            var blobList = await BlobContainer.ListBlobsSegmentedAsync($"project/{root.Key}/attachments", true,
                BlobListingDetails.All,
                int.MaxValue, null, new BlobRequestOptions(), new OperationContext());

            var size = blobList.Results.OfType<CloudBlockBlob>().Sum(blob => blob.Properties.Length);

            return Ok(new
            {
                Members = members,
                group.IsRoot,
                IsLinkedToDevOps = group.DevOpsRefreshToken != null,
                group.Finished,
                group.Name,
                size
            });
        }

        #endregion

        #region Requirements

        #endregion

        #region To do tasks

        [HttpPost("{groupId}/tasks")]
        public async Task<IActionResult> CreateTask(string groupId, [FromBody] CreateTaskRequest request)
        {
            // si no es administrador en ese grupo no puede crear tareas
            if (!await IsGroupAdmin(groupId, HttpContext.User.Identity.Name))
            {
                return Unauthorized();
            }

            // creamos una nueva tarea y la insertamos en la BD
            var task = new ToDoTask
            {
                Name = request.Name,
                Description = request.Description,
                DeliveryDate = request.DeliveryDate
            };
            await Database.InsertAsync<ToDoTask>(task);

            // Si no referencia a un requerimiento o a una tarea terminamos, de lo contrario debemos referenciar al requerimiento
            if (request.ReferenceRequirement != null && request.ReferenceTask == null)
            {
                // Checamos si ese requerimiento esta en algún lugar del grupo raíz, en caso de que no simplemente le decimos
                // que se creo el requerimiento pero hubo un error con el requerimiento
                if (!Database.CreateStatement<bool>(
                    $"LET rootGroup = (FOR v in 0..100 INBOUND 'Group/{groupId}' GRAPH 'SubgroupGraph' PRUNE v.isRoot == true FILTER v.isRoot == true return v)" +
                    $"LET requirements = (FOR v in 1 INBOUND rootGroup[0]._id GRAPH 'GroupRequirementsGraph' FILTER v._key == '{request.ReferenceRequirement}' return v)" +
                    $"return requirements == []").ToList().FirstOr(false))
                {
                    return Created($"api/groups/{groupId}/tasks/{task.Key}", new
                    {
                        Id = task.Key,
                        task.Name,
                        task.Description,
                        task.CreationDate,
                        task.DeliveryDate,
                        error = "Specified requirement cannot be found"
                    });
                }

                // creamos la referencia y especificamos algunos datos
                var referenceToRequirement = new TaskReferencingRequirement
                {
                    ReferencingDate = DateTime.UtcNow,
                    Requirement = $"Requirements/{request.ReferenceRequirement}",
                    ToDoTask = task.Id,
                    ContributionPercentage = request.ContributionPercentage
                };

                // Insertamos y listo
                var graph = Database.Graph("TasksReferencingRequirementGraph");
                await graph.InsertEdgeAsync<TaskReferencingRequirement>(referenceToRequirement);
            }
            else if (request.ReferenceRequirement == null && request.ReferenceTask != null)
            {
                var graph = Database.Graph("SubTasksGraph");
                var subTask = new SubTask
                {
                    ParentTask = request.ReferenceTask,
                    ChildTask = task.Id
                };
                await graph.InsertEdgeAsync<SubTask>(subTask);
            }

            // asociamos la tarea con el grupo
            await Database.Graph("GroupTasksGraph").InsertEdgeAsync<GroupTask>(new GroupTask
            {
                Group = $"Group/{groupId}",
                ToDoTask = task.Id
            });

            return Created($"api/groups/{groupId}/tasks/{task.Key}", new
            {
                Id = task.Key,
                task.Name,
                task.Description,
                task.CreationDate,
                task.DeliveryDate
            });
        }

        [HttpGet("{groupId}/tasks")]
        public async Task<IActionResult> GetTasksOfProject(string groupId)
        {
            // Checamos si el grupo existe
            if (!Database.CreateStatement<bool>(
                $"return (FOR g in " +
                $"Group FILTER g._key == '{groupId}' " +
                $"return g) != []").ToList().FirstOr(false))
            {
                return NotFound();
            }

            // checamos si el usuario es miembro del grupo
            if (!Database.CreateStatement<bool>($"return (FOR v in 1 INBOUND " +
                                                $"'Group/{groupId}' GRAPH 'GroupUsersGraph' " +
                                                $"FILTER v._key == '{HttpContext.User.Identity.Name}' " +
                                                $"return v) != []").ToList().FirstOr(false))
            {
                return NotFound();
            }

            var groupTasks = await
                Database.CreateStatement<ToDoTask>(
                    $"FOR v in 1 INBOUND 'Group/{groupId}' " +
                    $"GRAPH 'GroupTasksGraph' return v").ToListAsync();
            return Ok(groupTasks.Select(t => new
            {
                Id = t.Key,
                t.Name,
                t.Description,
                t.CreationDate,
                t.DeliveryDate,
                t.Progress
            }));
        }

        [HttpGet("{groupId}/tasks/{taskId}")]
        public async Task<IActionResult> GetTaskInfo(string groupId, string taskId)
        {
            if (!Database.CreateStatement<bool>($"return (FOR v in 1 INBOUND " +
                                                $"'Group/{groupId}' GRAPH 'GroupUsersGraph' " +
                                                $"FILTER v._key == '{HttpContext.User.Identity.Name}' " +
                                                $"return v) != []").ToList().FirstOr(false))
            {
                return NotFound();
            }

            var task = (await Database.CreateStatement<ToDoTask>($"FOR v in 1 INBOUND " +
                                                                 $"'Group/{groupId}' GRAPH 'GroupTasksGraph' FILTER v._key == '{taskId}' return v")
                .ToListAsync()).FirstOr(null);
            if (task == null) return NotFound();
            return Ok(new
            {
                Id = task.Key,
                task.DeliveryDate,
                task.CreationDate,
                task.Description,
                task.Name,
                task.Progress
            });
        }

        [HttpPut("{groupId}/tasks/{taskId}")]
        public async Task<IActionResult> ModifyTask(string groupId, string taskId, [FromBody] ModifyTaskRequest request)
        {
            var task = (await Database.CreateStatement<ToDoTask>($"FOR v in 1 INBOUND " +
                                                                 $"'Group/{groupId}' GRAPH 'GroupTasksGraph' FILTER v._key == '{taskId}' return v")
                .ToListAsync()).FirstOr(null);
            if (task == null)
            {
                return NotFound();
            }

            if (await IsGroupAdmin(groupId, HttpContext.User.Identity.Name))
            {
                task.Description = request.NewDescription ?? task.Description;
                task.Name = request.NewName ?? task.Name;
            }

            task.Progress = request.NewProgress ?? task.Progress;

            await Database.UpdateByIdAsync<ToDoTask>(task.Id, task);

            return Ok();
        }

        [HttpDelete("{groupId}/tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(string groupId, string taskId)
        {
            if (!await IsGroupAdmin(groupId, HttpContext.User.Identity.Name))
            {
                return Unauthorized();
            }

            var task = (await Database.CreateStatement<ToDoTask>($"FOR v in 1 INBOUND " +
                                                                 $"'Group/{groupId}' GRAPH 'GroupTasksGraph' FILTER v._key == '{taskId}' return v")
                .ToListAsync()).FirstOr(null);
            if (task == null)
            {
                return NotFound();
            }

            var tasksGraph = Database.Graph("TasksGraph");
            if (!await tasksGraph.RemoveVertexByIdAsync<ToDoTask>(task.Id))
                return StatusCode(500, new {Message = "Task could not be deleted"});
            return Ok();
        }

        [HttpPost("{groupId}/tasks/{taskId}")]
        public async Task<IActionResult> AssignTaskToSubGroup(string groupId, string taskId,
            [FromBody] AssignTaskRequest request)
        {
            if (!await IsGroupAdmin(groupId, HttpContext.User.Identity.Name))
            {
                return Unauthorized();
            }

            if (request.GroupId != null && request.UserId == null)
            {
                if (!Database.CreateStatement<bool>($"return (FOR v IN 1 OUTBOUND " +
                                                    $"'Group/{groupId}' GRAPH 'SubgroupGraph' FILTER v._key == '{request.GroupId}' return v) != []")
                    .ToList().FirstOr(false))
                {
                    return BadRequest(new {Message = $"Group with id {request.GroupId} doesn't exist"});
                }

                // intentamos insertar, si uno de los 2 no existe entonces regresamos un bad request
                try
                {
                    await Database.Graph("AssignedGroupTasksGraph").InsertEdgeAsync<AssignedGroupTask>(
                        new AssignedGroupTask
                        {
                            Group = $"Group/{request.GroupId}",
                            ToDoTask = $"ToDoTasks/{taskId}"
                        });
                }
                catch (Exception)
                {
                    return BadRequest();
                }
            }
            else if (request.GroupId == null && request.UserId != null)
            {
                if (!Database.CreateStatement<bool>($"return (FOR v IN 1 INBOUND " +
                                                    $"'Group/{groupId}' GRAPH 'GroupUsersGraph' " +
                                                    $"FILTER v._key == '{request.UserId}' return v) != []").ToList()
                    .FirstOr(false))
                {
                    return BadRequest(new
                        {Message = $"User with id {request.GroupId} is not a member of this group or doesn't exist"});
                }

                try
                {
                    await Database.Graph("AssignedUserTasksGraph").InsertEdgeAsync<AssignedUserTask>(
                        new AssignedUserTask
                        {
                            User = $"User/{request.UserId}",
                            ToDoTask = $"ToDoTasks/{taskId}"
                        });
                }
                catch (Exception)
                {
                    return BadRequest();
                }
            }
            else return BadRequest();

            return Ok();
        }

        #endregion

        #region GitHub repo

        [HttpPut("{groupId}/github/link")]
        public async Task<IActionResult> LinkToRepository(string groupId,
            [FromBody] (long id, object dummy) repositoryId)
        {
            var root = await Database.GetRootGroup(groupId);
            var repoId = repositoryId.Item1;
            if (root == null)
            {
                return NotFound();
            }

            if (!await Database.IsAdmin(HttpContext.User.Identity.Name, groupId))
            {
                return Unauthorized();
            }

            var admin = await Database.DocumentAsync<User>(root.GroupOwner);
            var client = new GitHubClient(new ProductHeaderValue("maxorg"));

            var tokenAuth = new Credentials(admin.GithubToken);
            client.Credentials = tokenAuth;

            var repo = await client.Repository.Get(repoId);
            if (repo == null)
            {
                return BadRequest();
            }

            root.LinkedRepositoryName = repoId;
            await Database.UpdateByIdAsync<Group>(root.Id, root);
            return Ok();
        }

        [HttpGet("{groupId}/github/code")]
        public async Task<IActionResult> GetCode(string groupId, [FromQuery] string path = "/")
        {
            var root = await Database.GetRootGroup(groupId);
            var isGroupMember = await Database.IsGroupMember(HttpContext.User.Identity.Name, root?.Key);
            if (root == null || !isGroupMember)
            {
                return NotFound();
            }

            if (root.LinkedRepositoryName == null)
            {
                return StatusCode(403);
            }

            var admin = await Database.DocumentAsync<User>(root.GroupOwner);
            var client = new GitHubClient(new ProductHeaderValue("maxorg"));

            var tokenAuth = new Credentials(admin.GithubToken);
            client.Credentials = tokenAuth;

            var contents = await client.Repository.Content.GetAllContents(root.LinkedRepositoryName.Value, path);

            return Ok(contents.Select(c => new
            {
                c.HtmlUrl,
                Type = c.Type.StringValue,
                c.Name,
                c.Path
            }).OrderBy(c => c.Type == "file"));
        }

        [HttpGet("{groupId}/github/issues")]
        public async Task<IActionResult> GetIssues(string groupId)
        {
            var root = await Database.GetRootGroup(groupId);
            if (root == null || !await Database.IsGroupMember(HttpContext.User.Identity.Name, root?.Key))
            {
                return NotFound();
            }

            if (root.LinkedRepositoryName == null)
            {
                return StatusCode(403);
            }

            var admin = await Database.DocumentAsync<User>(root.GroupOwner);
            var client = new GitHubClient(new ProductHeaderValue("maxorg"));

            var tokenAuth = new Credentials(admin.GithubToken);
            client.Credentials = tokenAuth;

            var issues = await client.Issue.GetAllForRepository(root.LinkedRepositoryName.Value);

            return Ok(issues.Select(i => new
            {
                i.HtmlUrl,
                i.Id,
                i.Title,
                i.Number
            }));
        }

        [HttpGet("{groupId}/github/commits")]
        public async Task<IActionResult> GetCommits(string groupId)
        {
            var root = await Database.GetRootGroup(groupId);
            if (root == null || !await Database.IsGroupMember(HttpContext.User.Identity.Name, root?.Key))
            {
                return NotFound();
            }

            if (root.LinkedRepositoryName == null)
            {
                return StatusCode(403);
            }

            var admin = await Database.DocumentAsync<User>(root.GroupOwner);
            var client = new GitHubClient(new ProductHeaderValue("maxorg"));

            var tokenAuth = new Credentials(admin.GithubToken);
            client.Credentials = tokenAuth;
            var commits = await client.Repository.Commit.GetAll(root.LinkedRepositoryName.Value);

            return Ok(commits.Select(c => new
            {
                c.HtmlUrl,
                c.Commit.Author.Name,
                c.Commit.Message
            }));
        }

        #endregion

        #region Upload options

        [HttpPost("{groupId}/attachments")]
        public async Task<IActionResult> UploadFile(string groupId, IFormFile file)
        {
            var root = await Database.GetRootGroup(groupId);
            if (root == null)
            {
                return NotFound();
            }

            var blobList = await BlobContainer.ListBlobsSegmentedAsync($"project/{root.Key}/attachments", true,
                BlobListingDetails.All,
                int.MaxValue, null, new BlobRequestOptions(), new OperationContext());

            var size = blobList.Results.OfType<CloudBlockBlob>().Sum(blob => blob.Properties.Length);
            if (size > 524288000)
            {
                return BadRequest(new {message = "Size exceded"});
            }

            var extension = System.IO.Path.GetExtension(file.FileName);
            var attachmentName = $"{ShortId.Generate(true, false, 20)}" +
                                 $"{extension}";
            var attachment =
                BlobContainer.GetBlockBlobReference($"project/{root.Key}/attachments/{attachmentName}");
            await attachment.UploadFromStreamAsync(file.OpenReadStream());
            await attachment.FetchAttributesAsync();
            attachment.Properties.ContentType = file.ContentType;
            await attachment.SetPropertiesAsync();
            return Ok(new
            {
                Url = $"/api/groups/{groupId}/attachments/{attachmentName}",
                file.FileName
            });
        }

        [HttpGet("{groupId}/attachments/{attachmentName}")]
        public async Task<IActionResult> GetAttachment(string groupId, string attachmentName)
        {
            var root = await Database.GetRootGroup(groupId);
            if (root == null)
            {
                return NotFound();
            }

            var attachment =
                BlobContainer.GetBlockBlobReference($"project/{root.Key}/attachments/{attachmentName}");
            if (!await attachment.ExistsAsync())
            {
                return NotFound();
            }

            var sasConstraints = new SharedAccessBlobPolicy
            {
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddMinutes(10),
                Permissions = SharedAccessBlobPermissions.Read
            };

            var sasBlobToken = attachment.GetSharedAccessSignature(sasConstraints);
            return Redirect(attachment.Uri + sasBlobToken);
        }

        #endregion

        #region DevOps integration

        [HttpPost("{groupId}/devops")]
        public async Task<IActionResult> LinkToDevOps(string groupId, [FromQuery] string code)
        {
            var root = await Database.GetRootGroup(groupId);
            if (code == null || root == null)
            {
                return BadRequest();
            }

            var token = await DevOpsHelper.GetAccessToken(Configuration, code, HttpClient);
            if (token == null) return BadRequest();
            root.DevOpsRefreshToken = token.RefreshToken;
            root.DevOpsToken = token.AccessToken;
            root.DevOpsExpirationTime = DateTime.UtcNow.AddSeconds(3000);
            await Database.UpdateByIdAsync<Group>(root.Id, root);
            return Ok();
        }

        [HttpPut("{groupId}/devops")]
        public async Task<IActionResult> SetProjectDevOpsInfo(string groupId,
            [FromBody] (string orgName, string projectName) info)
        {
            var root = await Database.GetRootGroup(groupId);
            if (root == null) return NotFound();
            if (!await Database.IsAdmin(HttpContext.User.Identity.Name, root.Key)) return Unauthorized();
            var (orgName, projectName) = info;
            root.DevOpsOrgName = orgName;
            root.DevOpsProjectName = projectName;
            await Database.UpdateByIdAsync<Group>(root.Id, root);
            return Ok();
        }

        [HttpPost("{groupId}/tests")]
        public async Task<IActionResult> QueueBuild(string groupId, [FromBody] (int definitionId, string name) data)
        {
            var group = await Database.Collection("Group").DocumentAsync<Group>(groupId);
            var root = await Database.GetRootGroup(groupId);
            if (group == null || root?.DevOpsRefreshToken == null ||
                !await Database.IsGroupMember(HttpContext.User.Identity.Name, groupId))
            {
                return NotFound();
            }

            var token = await DevOpsHelper.GetAccessToken(Configuration, root, HttpClient, Database);
            if (token == null) return BadRequest();
            var id = await DevOpsHelper.CreateBuild(token, root.DevOpsOrgName, root.DevOpsProjectName,
                HttpClient, data.definitionId);
            if (id == -1) return BadRequest();

            var test = new Test
            {
                BuildId = id,
                Name = data.name
            };
            await Database.InsertAsync<Test>(test);
            var createdTestInGroup = new CreatedTest
            {
                Group = group.Id,
                Test = test.Id,
                CreatorId = HttpContext.User.Identity.Name
            };
            await Database.InsertAsync<CreatedTest>(createdTestInGroup);

            return Ok(new {testId = test.Key});
        }

        [HttpGet("{groupId}/tests")]
        public async Task<IActionResult> GetTests(string groupId)
        {
            var rootGroup = await Database.GetRootGroup(groupId);
            if (rootGroup == null) return NotFound();
            var userId = HttpContext.User.Identity.Name;
            if (await Database.IsGroupMember(userId, groupId) && !await Database.IsAdmin(userId, groupId))
            {
                return await GetUserTest(groupId);
            }

            if (await Database.IsAdmin(userId, groupId))
            {
                return await GetAdminTestReports(groupId);
            }

            return BadRequest();
        }

        [HttpPut("{groupId}/tests/{testId}")]
        public async Task<IActionResult> UpdateTest(string groupId, string testId,
            [FromBody] (string description, object dummy) description)
        {
            var test = (await Database.CreateStatement<Test>($@"FOR c, e, v in 1..1 INBOUND 'Tests/{testId}'
 GRAPH 'TestBuilds'
 FILTER c._key == '{groupId}' && e.creatorId == '{HttpContext.User.Identity.Name}'
 return v.vertices[0]").ToListAsync()).FirstOrDefault();
            if (test == null)
            {
                return NotFound();
            }

            test.Description = description.description;
            await Database.UpdateByIdAsync<Test>(test.Id, test);

            return Ok();
        }

        [HttpGet("{groupId}/tests/{testId}")]
        public async Task<IActionResult> GetTest(string groupId, string testId)
        {
            var test = (await Database.CreateStatement<Test>($@"FOR c, e, v in 1..1 INBOUND 'Tests/{testId}'
 GRAPH 'TestBuilds'
 FILTER c._key == '{groupId}'
 return v.vertices[0]").ToListAsync()).FirstOrDefault();
            if (test == null || !await Database.IsAdmin(HttpContext.User.Identity.Name, groupId))
            {
                return NotFound();
            }

            return Ok(new
            {
                test.Failed,
                Id = test.Key,
                test.Succeeded,
                test.Name,
                test.CreationDate,
                test.BuildId,
                test.Description
            });
        }
        
        private async Task<IActionResult> GetUserTest(string groupId)
        {
            var rootGroup = await Database.GetRootGroup(groupId);
            if (rootGroup == null) return NotFound();
            var tests = await Database.CreateStatement<Test>($@"FOR c, e in 1..1 OUTBOUND 'Group/{groupId}'
 GRAPH 'TestBuilds'
 FILTER e.creatorId == '{HttpContext.User.Identity.Name}' && c.description == null
 return c").ToListAsync();

            var token = await DevOpsHelper.GetAccessToken(Configuration, rootGroup, HttpClient, Database);
            if (token == null) return BadRequest();

            foreach (var test in tests)
            {
                if (test.Failed.HasValue) continue;
                var result = await DevOpsHelper.GetBuildResult(token, rootGroup.DevOpsOrgName,
                    rootGroup.DevOpsProjectName, test.BuildId, HttpClient);
                if (result == null || result.Count <= 0) continue;
                var testResult = result.Value[0];
                test.Succeeded = testResult.PassedTests;
                test.Failed = testResult.TotalTests - test.Succeeded.Value;
                await Database.UpdateByIdAsync<Test>(test.Id, test);
            }

            return Ok(new
            {
                Tests = tests.Select(t => new
                {
                    t.Failed,
                    Id = t.Key,
                    t.Succeeded,
                    t.Name,
                    t.CreationDate,
                    t.BuildId
                }),
                IsAdmin = false
            });
        }

        private async Task<IActionResult> GetAdminTestReports(string groupId)
        {
            var tests = await Database.CreateStatement<Test>($@"FOR c in 1..1 OUTBOUND 'Group/{groupId}'
 GRAPH 'TestBuilds'
 FILTER c.description != null
 return c").ToListAsync();
            return Ok(new
            {
                Tests = tests.Select(t => new
                {
                    t.Failed,
                    Id = t.Key,
                    t.Succeeded,
                    t.Name,
                    t.CreationDate,
                    t.BuildId,
                    t.Description
                }),
                IsAdmin = true
            });
        }

        [HttpGet("{groupId}/tests/build-definitions")]
        public async Task<IActionResult> GetBuildDefinitions(string groupId)
        {
            var group = await Database.Collection("Group").DocumentAsync<Group>(groupId);
            var root = await Database.GetRootGroup(groupId);
            if (group == null || root?.DevOpsRefreshToken == null ||
                !await Database.IsGroupMember(HttpContext.User.Identity.Name, groupId))
            {
                return NotFound();
            }

            var token = await DevOpsHelper.GetAccessToken(Configuration, root, HttpClient, Database);
            if (token == null) return BadRequest();
            var buildDefinitions =
                await DevOpsHelper.GetBuildDefinitions(token, root.DevOpsOrgName, root.DevOpsProjectName, HttpClient);
            return Ok(buildDefinitions.Value);
        }

        #endregion

        /// <summary>
        /// Obtiene un valor de verdadero o falso si un usuario en cuestión es administrador de un grupo definido por un
        /// identificador
        /// </summary>
        /// <param name="currentGroup">
        /// Identificador del grupo en el que se desea saber si determinado usuario es administrador
        /// </param>
        /// <param name="userId">
        /// Identificador del usuario del que se desea saber si es administrador de cierto grupo
        /// </param>
        /// <returns>
        /// Asincronicamente retorna verdadero si es administrador, de lo contrario retorna false
        /// </returns>
        private async Task<bool> IsGroupAdmin(string currentGroup, string userId)
        {
            var db = Database;
            var graph = db.Graph("GroupUsersGraph");

            var user = await (from u in db.Query<User>()
                where u.Key == userId
                select u).FirstOrDefaultAsync();
            var traversal = db.Traverse<User, UsersInGroup>(new TraversalConfig
            {
                StartVertex = "Group/" + currentGroup,
                GraphName = graph.Name,
                Direction = EdgeDirection.Inbound,
                MinDepth = 1,
                MaxDepth = 1
            });
            return (from u in traversal.Visited.Paths
                from e in u.Edges
                where e.User == "User/" + userId
                select e.IsAdmin).FirstOrDefault();
        }

        private async Task<Group> GetGroup(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                return await db.Query<Group>().Where(g => g.Key == groupId).Select(g => g).FirstOrDefaultAsync();
            }
        }

        /// <summary>
        /// Obtiene la lista de usuarios de determinado grupo
        /// </summary>
        /// <param name="groupId">
        /// Identificador del grupo del que se desea obtener todos los usuarios
        /// </param>
        /// <returns></returns>
        private List<User> GetGroupMembers(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var graph = db.Graph("GroupUsersGraph");

                var traverse = db.Traverse<User, UsersInGroup>(new TraversalConfig
                {
                    StartVertex = "Group/" + groupId,
                    GraphName = graph.Name,
                    Direction = EdgeDirection.Inbound,
                    MinDepth = 1,
                    MaxDepth = 1
                });

                return traverse.Visited.Vertices;
            }
        }

        private async Task<bool> IsAdmin(string groupId)
        {
            var result = await Database.CreateStatement<bool>(
                $@"LET isAdmin = (FOR v in 0..5000 INBOUND 'Group/{groupId}' Graph 'SubgroupGraph' 
PRUNE v.groupOwner == '{HttpContext.User.Identity.Name}' FILTER v.groupOwner == '{HttpContext.User.Identity.Name}' return v)
return isAdmin != []").ToListAsync();
            return result.Count != 0 && result[0];
        }
    }
}