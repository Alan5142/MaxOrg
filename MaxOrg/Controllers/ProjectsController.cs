using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MaxOrg.Models.Requirements;
using Microsoft.EntityFrameworkCore.Internal;

namespace MaxOrg.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private IHubContext<NotificationHub> m_notificationHub;
        private readonly IArangoDatabase Database;

        public ProjectsController(IHubContext<NotificationHub> notificationHub, IArangoDatabase database)
        {
            Database = database;
            m_notificationHub = notificationHub;
        }

        [HttpGet]
        public IActionResult GetUserProjects()
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var traversal = db.Traverse<Group, UsersInGroup>(new TraversalConfig
                {
                    StartVertex = "User/" + HttpContext.User.Identity.Name,
                    GraphName = "GroupUsersGraph",
                    Direction = EdgeDirection.Outbound,
                    MinDepth = 1
                });
                var projects = from g in traversal.Visited.Vertices
                    from u in db.Query<User>()
                    where g.IsRoot && g.GroupOwner == u.Key
                    select new
                    {
                        g.Name,
                        Id = g.Key,
                        ProjectOwner = u.Username
                    };
                return Ok(new {projects});
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreationData data)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var currentDate = DateTime.UtcNow;

                var currentUser = await (from u in db.Query<User>()
                    where u.Key == HttpContext.User.Identity.Name
                    select u).FirstOrDefaultAsync();
                if (currentUser == null)
                {
                    return Unauthorized();
                }

                var groupGraph = db.Graph("GroupUsersGraph");

                // obtenemos los usuarios
                var usersToAdd = from u in db.Query<User>()
                    from ud in data.Members
                    where u.Username == ud
                    select u;

                if (data.Members.Count != usersToAdd.Count())
                {
                    return BadRequest(new {message = "Some users are invalid"});
                }

                // En caso de que el usuario haya puesto su nombre de usuario, lo eliminamos, el se añade aparte puesto que será administrador
                usersToAdd = from u in usersToAdd
                    where u.Key != currentUser.Key
                    select u;

                var projectGroup = new Group
                {
                    CreationDate = currentDate,
                    Name = data.Name,
                    GroupOwner = HttpContext.User.Identity.Name,
                    IsRoot = true,
                    Description =
                        $"# {data.Name}\nEsta descripción es generada automaticamente, si eres el administrador puedes cambiarla en el panel de administrador",
                    KanbanBoards = new List<KanbanBoard> {new KanbanBoard(data.Name)}
                };

                // Default kanban creation
                projectGroup.KanbanBoards[0].Members = await usersToAdd.Select(u => u.Key).ToListAsync();
                projectGroup.KanbanBoards[0].Members.Add(currentUser.Key);

                var createdGroup = await db.InsertAsync<Group>(projectGroup);

                var admin = new UsersInGroup
                {
                    IsAdmin = true,
                    JoinDate = currentDate,
                    Group = createdGroup.Id,
                    User = "User/" + currentUser.Key,
                    AddedBy = currentUser.Key
                };
                // create a relation between root group and the creator
                await groupGraph.InsertEdgeAsync<UsersInGroup>(admin);

                foreach (var user in usersToAdd)
                {
                    var userToAdd = new UsersInGroup
                    {
                        IsAdmin = false,
                        JoinDate = currentDate,
                        Group = createdGroup.Id,
                        User = "User/" + user.Key,
                        AddedBy = currentUser.Key
                    };
                    await groupGraph.InsertEdgeAsync<UsersInGroup>(userToAdd);

                    var notificationMessage = string.Format($"{currentUser.Username} te ha agregado " +
                                                            $"al proyecto '{projectGroup.Name}'", projectGroup.Name);

                    // enviar la notificación
                    await m_notificationHub.Clients
                        .Group("Users/" + user.Key)
                        .SendAsync("notificationReceived", notificationMessage);

                    var notification = new Notification
                    {
                        Read = false,
                        Message = notificationMessage,
                        // TODO checar prioridad
                        Priority = NotificationPriority.Medium,
                        Context = $"project/{createdGroup.Key}"
                    };
                    user.Notifications.Add(notification);
                    await db.UpdateByIdAsync<User>(user.Id, user);
                }

                // TODO trigger notification

                return Created("/api/projects/" + createdGroup.Key, null);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(string id)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var project = await (from p in db.Query<Group>()
                    where p.Key == id && p.IsRoot == true
                    select p).FirstOrDefaultAsync();
                if (project == null)
                {
                    return NotFound();
                }

                var graph = db.Graph("GroupUsersGraph");
                var traversal = db.Traverse<User, UsersInGroup>(new TraversalConfig
                {
                    StartVertex = project.Id,
                    GraphName = graph.Name,
                    Direction = EdgeDirection.Inbound,
                    MinDepth = 1,
                    MaxDepth = 1
                });
                var members = from u in traversal.Visited.Vertices
                    select new {u.Key, u.Username};
                if (members.Where(u => u.Key == HttpContext.User.Identity.Name).Count() == 0)
                {
                    return NotFound();
                }

                var subgrp = GetSubgroupHierarchy(project.Key);

                var subgroups = db.Traverse<Group, Subgroup>(new TraversalConfig
                {
                    StartVertex = project.Id,
                    GraphName = "SubgroupGraph",
                    Direction = EdgeDirection.Outbound,
                    MinDepth = 1
                });

                var returnMessage = new
                {
                    Id = project.Key,
                    project.Name,
                    project.Description,
                    project.GroupOwner,
                    project.CreationDate,
                    members,
                    subgroups = subgrp
                };
                return Ok(returnMessage);
            }
        }

        private GroupHierarchy[] GetSubgroupHierarchy(string projectId)
        {
            // first subgroups
            var subgroups = GetSubgroups(projectId);
            foreach (var subgroup in subgroups)
            {
                subgroup.Subgroups = GetSubgroupHierarchy(subgroup.Id);
                subgroup.Members = GetGroupMembers(subgroup.Id);
            }

            return subgroups;
        }

        private UserGroupView[] GetGroupMembers(string projectId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var traversal = db.Traverse<User, UsersInGroup>(new TraversalConfig
                {
                    StartVertex = "Group/" + projectId,
                    GraphName = "GroupUsersGraph",
                    Direction = EdgeDirection.Inbound,
                    MinDepth = 1,
                    MaxDepth = 1
                });
                var members = from u in traversal.Visited.Vertices
                    select new UserGroupView
                    {
                        Key = u.Key,
                        Username = u.Username
                    };
                return members.ToArray();
            }
        }

        private GroupHierarchy[] GetSubgroups(string groupId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var subgroups = db.Traverse<Group, Subgroup>(new TraversalConfig
                {
                    StartVertex = "Group/" + groupId,
                    GraphName = "SubgroupGraph",
                    Direction = EdgeDirection.Outbound,
                    MinDepth = 1,
                    MaxDepth = 1
                }).Visited.Vertices.Select(g =>
                    new GroupHierarchy // we map this subgroups to a group hierarchy structure
                    {
                        Id = g.Key,
                        Name = g.Name,
                        Description = g.Description,
                        GroupOwner = g.GroupOwner,
                        CreationDate = g.CreationDate
                    });
                return subgroups.ToArray();
            }
        }

        #region Requirements

        [Authorize]
        [HttpGet("{projectId}/requirements")]
        public async Task<IActionResult> GetRequirements(string projectId)
        {
            var userIsInProject = (await Database.CreateStatement<dynamic>(
                                      $"FOR vertex IN 1..1 INBOUND 'Group/{projectId}' " +
                                      $"GRAPH 'GroupUsersGraph' FILTER vertex._key == '{HttpContext.User.Identity.Name}'" +
                                      " return vertex._key").ToListAsync()).Count == 1;
            if (!userIsInProject)
            {
                return Unauthorized();
            }

            var isProject = await Database
                .CreateStatement<bool>($"FOR group in Group FILTER group._key == '{projectId}' RETURN group.isRoot")
                .ToListAsync();
            if (isProject.Count == 0 || isProject[0] == false)
            {
                return NotFound();
            }

            var requirements = await Database.CreateStatement<Requirement>(
                $"FOR vertex, edge, p IN 1..1 INBOUND 'Group/{projectId}'" +
                $" GRAPH 'GroupRequirementsGraph' FILTER p.vertices[0].isRoot == true" +
                $" return vertex").ToListAsync();
            return Ok(requirements.Select(r => new
            {
                Id = r.Key,
                r.Description,
                r.CreationDate,
                r.RequirementType
            }));
        }

        [Authorize]
        [HttpPost("{projectId}/requirements")]
        public async Task<IActionResult> CreateRequirement(string projectId,
            [FromBody] CreateRequirementRequest request)
        {
            var isProject = await Database
                .CreateStatement<bool>($"FOR group in Group FILTER group._key == '{projectId}' RETURN group.isRoot")
                .ToListAsync();

            if (isProject.Count == 0 || isProject[0] == false)
            {
                return NotFound();
            }

            var userIsAdminQuery = $"FOR vertex, edge, p IN 1..1 INBOUND 'Group/{projectId}'" +
                                   $" GRAPH 'GroupUsersGraph' FILTER vertex._key == '{HttpContext.User.Identity.Name}' " +
                                   $"FILTER p.vertices[0].groupOwner == '{HttpContext.User.Identity.Name}'" +
                                   " return vertex._key";
            var isUserAdmin = (await Database.CreateStatement<dynamic>(userIsAdminQuery).ToListAsync()).Count == 1;
            if (!isUserAdmin)
            {
                return NotFound();
            }

            var requirement = new Requirement
            {
                Description = request.Description,
                RequirementType = request.Type
            };
            var createdRequirement = await Database.InsertAsync<Requirement>(requirement);

            var graph = Database.Graph("GroupRequirementsGraph");
            var groupRequirement = new GroupRequirement()
            {
                Group = $"Group/{projectId}",
                Requirement = createdRequirement.Id
            };
            await graph.InsertEdgeAsync<GroupRequirement>(groupRequirement);
            return Created($"./api/projects/{projectId}/requirements/{createdRequirement.Key}", new
            {
                Id = requirement.Key,
                requirement.Description,
                requirement.CreationDate,
                requirement.RequirementType
            });
        }

        [Authorize]
        [HttpGet("{projectId}/requirements/{requirementId}")]
        public async Task<IActionResult> GetProjectRequirement(string projectId, string requirementId)
        {
            var userIsInProject = (await Database.CreateStatement<dynamic>(
                                      $"FOR vertex IN 1..1 INBOUND 'Group/{projectId}' " +
                                      $"GRAPH 'GroupUsersGraph' FILTER vertex._key == '{HttpContext.User.Identity.Name}'" +
                                      " return vertex._key").ToListAsync()).Count == 1;
            if (!userIsInProject)
            {
                return Unauthorized();
            }

            var isProject = await Database
                .CreateStatement<bool>($"FOR group in Group FILTER group._key == '{projectId}' RETURN group.isRoot")
                .ToListAsync();

            if (isProject.Count == 0 || isProject[0] == false)
            {
                return NotFound();
            }

            var requirementQuery = $"FOR vertex, edge, p IN 1..1 INBOUND 'Group/{projectId}'" +
                                   $" GRAPH 'GroupRequirementsGraph' FILTER p.vertices[0].isRoot == true" +
                                   $" FILTER vertex._key == '{requirementId}'" +
                                   $" return vertex";
            var requirement = (await Database.CreateStatement<Requirement>(requirementQuery).ToListAsync())
                .FirstOrDefault();
            if (requirement == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                Id = requirement.Key,
                requirement.Description,
                requirement.CreationDate,
                requirement.RequirementType
            });
        }

        [Authorize]
        [HttpDelete("{projectId}/requirements/{requirementId}")]
        public async Task<IActionResult> DeleteProjectRequirement(string projectId, string requirementId)
        {
            var userIsAdminQuery = $"FOR vertex, edge, p IN 1..1 INBOUND 'Group/{projectId}'" +
                                   $" GRAPH 'GroupUsersGraph' FILTER vertex._key == '{HttpContext.User.Identity.Name}' " +
                                   $"FILTER p.vertices[0].groupOwner == '{HttpContext.User.Identity.Name}'" +
                                   " return vertex._key";
            var isUserAdmin = (await Database.CreateStatement<dynamic>(userIsAdminQuery).ToListAsync()).Count == 1;
            if (!isUserAdmin)
            {
                return NotFound();
            }

            var groupContainsRequirementWithIdQuery = $"return (FOR v in 1..1 INBOUND " +
                                                      $"'Group/{projectId}' GRAPH 'GroupRequirementsGraph' " +
                                                      $"FILTER v._key == '{requirementId}' return v) != []";
            if (Database.CreateStatement<bool>(groupContainsRequirementWithIdQuery).ToList().FirstOr(false) == false)
            {
                return NotFound();
            }

            var graph = Database.Graph("GroupRequirementsGraph");

            await graph.RemoveVertexByIdAsync<Requirement>($"Requirements/{requirementId}");
            return Ok();
        }

        [Authorize]
        [HttpPut("{projectId}/requirements/{requirementId}")]
        public async Task<IActionResult> ModifyProjectRequirement(string projectId,
            string requirementId,
            [FromBody] ModifyRequirementRequest request)
        {
            var userIsAdminQuery = $"FOR vertex, edge, p IN 1..1 INBOUND 'Group/{projectId}'" +
                                   $" GRAPH 'GroupUsersGraph' FILTER vertex._key == '{HttpContext.User.Identity.Name}' " +
                                   $"FILTER p.vertices[0].groupOwner == '{HttpContext.User.Identity.Name}'" +
                                   " return vertex._key";
            var isUserAdmin = (await Database.CreateStatement<dynamic>(userIsAdminQuery).ToListAsync()).Count == 1;
            if (!isUserAdmin)
            {
                return NotFound();
            }

            var groupContainsRequirementWithIdQuery = $"return (FOR v in 1..1 INBOUND " +
                                                      $"'Group/{projectId}' GRAPH 'GroupRequirementsGraph' " +
                                                      $"FILTER v._key == '{requirementId}' return v) != []";
            if (Database.CreateStatement<bool>(groupContainsRequirementWithIdQuery).ToList().FirstOr(false) == false)
            {
                return NotFound();
            }

            var requirement = await (from r in Database.Query<Requirement>()
                where r.Key == requirementId
                select r).FirstOrDefaultAsync();
            requirement.Description = request.Description;
            await Database.UpdateByIdAsync<Requirement>(requirement.Id, requirement);
            return Ok();
        }

        #endregion
    }
}