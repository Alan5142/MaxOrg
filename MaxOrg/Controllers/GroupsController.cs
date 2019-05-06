using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Hubs.Clients;
using MaxOrg.Models;
using MaxOrg.Models.Kanban;
using MaxOrg.Models.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Internal;

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
        private readonly IArangoDatabase Database;
        private readonly IHubContext<KanbanHub, IKanbanClient> KanbanHub;

        public GroupsController(IArangoDatabase database, IHubContext<KanbanHub, IKanbanClient> kanbanHub)
        {
            KanbanHub = kanbanHub;
            Database = database;
        }

        /// <summary>
        /// Crea un grupo dentro de un grupo o un proyecto
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
                if (!await IsGroupAdmin(createGroup.CurrentGroupId, HttpContext.User.Identity.Name))
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
                    IsRoot = false
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
                }

                return Created("api/groups/" + createdGroup.Key, null);
            }
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

                if (!await IsGroupAdmin(groupId, HttpContext.User.Identity.Name))
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
            var db = Database;
            var group = await GetGroup(groupId);
            if (group == null)
            {
                return NotFound();
            }

            if (GetGroupMembers(groupId).Find(u => u.Key == HttpContext.User.Identity.Name) == null)
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
            if (@group == null)
            {
                return NotFound();
            }

            var members = GetGroupMembers(groupId).Select(u => new {u.Key, u.Username, u.Email});

            return Ok(new
                {@group.Name, @group.Key, @group.GroupOwner, @group.CreationDate, @group.Description, members});
        }

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
            kanbanBoards = from kb in kanbanBoards
                where kb.Members.Find(km => km.UserId == HttpContext.User.Identity.Name) != null
                select kb;
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

            return Ok(new
            {
                kanbanBoard.CreationDate,
                kanbanBoard.Id,
                kanbanBoard.KanbanGroups,
                kanbanBoard.Members,
                kanbanBoard.Name,
                CanEdit =
                    kanbanBoard.Members.Find(km => km.UserId == HttpContext.User.Identity.Name).MemberPermissions !=
                    KanbanMemberPermissions.Read
            });
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
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read)
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
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read)
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
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read)
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
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read)
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
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read)
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
            if (memberData?.MemberPermissions == KanbanMemberPermissions.Read)
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
                Description = request.Description
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
                task.CreationDate
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
    }
}