using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        public GroupsController()
        {
        }

        /// <summary>
        /// Crea un grupo dentro de un grupo o un proyecto
        /// </summary>
        /// <param name="createGroup">
        /// Información requerida para poder crear el grupo
        /// </param>
        /// <returns>
        /// BadRequest si algún parametro ingresado por el usuario junto con un mensaje de descripción
        /// Created junto con la dirección del recurso si se creo exitosamente
        /// </returns>
        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest createGroup)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var currentDate = DateTime.Now;

                // El usuario no es administrador del grupo que se planea hacer un subgrupo
                if (!await IsGroupAdmin(createGroup.CurrentGroupId, HttpContext.User.Identity.Name))
                {
                    return Unauthorized();
                }
                // Subgroup admin doesn't exist
                var subgroupAdmin = await db.Query<User>().Where(u => u.Key == createGroup.SubgroupAdminId).FirstOrDefaultAsync();
                if (subgroupAdmin == null)
                {
                    return BadRequest(new { message = "Invalid subgroup admin" });
                }

                var groupGraph = db.Graph("GroupUsersGraph");

                var usersToAdd = from u in db.Query<User>()
                                 from ud in createGroup.Members
                                 where u.Username == ud
                                 select u;

                var groupMembers = GetGroupMembers(createGroup.CurrentGroupId);

                if (groupMembers.Find(u => u.Key == createGroup.SubgroupAdminId) == null)
                {
                    return BadRequest(new { message = "Invalid subgroup admin id" });
                }

                usersToAdd = from u in usersToAdd
                             from um in groupMembers
                             where u.Key == um.Key
                             select u;

                // Algunos usuarios no son validos
                if (createGroup.Members.Count != usersToAdd.Count())
                {
                    return BadRequest(new { message = "Some users are invalid" });
                }

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
        public async Task<IActionResult> ChangeGroupDescription(string groupId, [FromBody] ChangeGroupDescriptionRequest newDescription)
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
                // TODO sanitize c:
                group.Description = newDescription.NewDescription;
                await db.UpdateByIdAsync<Group>(group.Id, group);
            }
            return Ok();
        }

        [HttpGet("{groupId}/description")]
        public async Task<IActionResult> GetGroupDescription(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
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
                return Ok(new { group.Description });
            }
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupInfo(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var group = await (from g in db.Query<Group>()
                                   where g.Key == groupId && g.IsRoot == false
                                   select g).FirstOrDefaultAsync();
                if (group == null)
                {
                    return NotFound();
                }
                var members = GetGroupMembers(groupId).Select(u => new { u.Key, u.Username, u.Email });

                return Ok(new { group.Name, group.Key, group.GroupOwner, group.CreationDate, group.Description, members });
            }
        }

        #region Kanban Boards

        [HttpPost("{groupId}/boards")]
        public async Task<IActionResult> CreateBoard(string groupId, [FromBody] CreateKanbanBoardRequest request)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var group = await GetGroup(groupId);
                if (group == null)
                {
                    return NotFound();
                }
                group.KanbanBoards.Add(new KanbanBoard(request.Name));
                var createdBoard = group.KanbanBoards.Last();
                createdBoard.Members.Add(HttpContext.User.Identity.Name);
                await db.UpdateByIdAsync<Group>(group.Id, group);
                return CreatedAtAction("api/" + groupId + "boards/" + group.KanbanBoards.Last().Id, createdBoard);
            }
        }

        [HttpGet("{groupId}/boards")]
        public async Task<IActionResult> GetBoardsOfGroup(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                IEnumerable<KanbanBoard> kanbanBoards = await (from g in db.Query<Group>()
                                                               from kb in g.KanbanBoards
                                                               where g.Key == groupId
                                                               select g.KanbanBoards).FirstOrDefaultAsync();
                kanbanBoards = from kb in kanbanBoards
                               where kb.Members.Contains(HttpContext.User.Identity.Name)
                               select kb;
                if (kanbanBoards == null)
                {
                    return NotFound();
                }
                // send only names and ids

                return Ok(new
                {
                    boards = from kb in kanbanBoards
                             select new { kb.Name, kb.Id }
                });
            }
        }

        [HttpGet("{groupId}/boards/{boardId}")]
        public async Task<IActionResult> GetBoardWithId(string groupId, string boardId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var boards = await (from g in db.Query<Group>()
                                    from kb in g.KanbanBoards
                                    where g.Key == groupId && kb.Members.Contains(HttpContext.User.Identity.Name) && kb.Id == boardId
                                    select g).FirstOrDefaultAsync();
                if (boards == null)
                {
                    return NotFound();
                }
                var kanbanBoard = boards.KanbanBoards.FirstOrDefault();

                if (kanbanBoard == null)
                {
                    return NotFound();
                }
                return Ok(kanbanBoard);
            }
        }

        [HttpPost("{groupId}/boards/{boardId}/sections/{sectionId}/cards")]
        public async Task<IActionResult> CreateCardInSection(string groupId, string boardId, string sectionId, [FromBody] CreateKanbanCardInSectionRequest cardInfo)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var group = await (from g in db.Query<Group>()
                                   where g.Key == groupId
                                   select g).FirstOrDefaultAsync();
                if (group == null)
                {
                    return NotFound();
                }
                var kanbanSection = (from kb in @group.KanbanBoards
                                    where kb.Id == boardId
                                    from ks in kb.KanbanGroups
                                    where ks.Id == sectionId
                                    select ks).FirstOrDefault();
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
                await db.UpdateByIdAsync<Group>(group.Id, group);
                return Ok();
            }
        }
        #endregion

        private async Task<bool> IsGroupAdmin(string currentGroup, string userId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
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
        }

        private async Task<Group> GetGroup(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                return await db.Query<Group>().Where(g => g.Key == groupId).Select(g => g).FirstOrDefaultAsync();
            }
        }

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
