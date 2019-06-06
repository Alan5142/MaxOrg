using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Hubs.Clients;
using MaxOrg.Models.Calendar;
using MaxOrg.Models.Group;
using MaxOrg.Models.Kanban;
using MaxOrg.Models.Notifications;
using MaxOrg.Models.Projects;
using MaxOrg.Models.Requirements;
using MaxOrg.Models.Users;
using MaxOrg.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Internal;

namespace MaxOrg.Controllers
{
    /// <summary>
    /// Clase que se encarga de la gestión de las peticiones HTTP relacionadas al manejo de proyectos, además
    /// cuenta con 3 atributos: Authorize, que indica que un usuario necesita iniciar sesión para utilizar
    /// cualquiera de sus métodos, Route que indica que todas las rutas que tengan coincidencia con el patrón establecido
    /// en el parametro del atributo, que es "api/[controller]", siendo controller "project" y ApiController, que indica que
    /// la clase maneja una API HTTP. Si el usuario que pide un recurso no tiene sesión iniciada se le responde con un
    /// código de error HTTP 401
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        /// <summary>
        /// Referencia al hub de SignalR "NotificationHub", que es utilizado para enviar notificaciones a los clientes
        /// en tiempo real mediante WebSockets, esta propiedad es dada a la clase mediante una inyección de dependencias
        /// dada por ASP.NET Core.
        /// </summary>
        private IHubContext<NotificationHub> NotificationHub { get; }
        
        private IHubContext<ReadOnlyProjectHub, IReadOnlyClient> ReadOnlyGroupHub { get; }

        /// <summary>
        /// Instancia transitoria de una conexión a la base de datos, es generada por ASP.NET Core por cada llamada a un método del controlador
        /// mediante un método que le indica como debe crear la conexión, al momento de terminar la llamada al método
        /// ASP.NET Core se encarga de liberar los recursos mediante el método Dispose() de la interfaz IDisposable que
        /// implementa IArangoDatabase
        /// </summary>
        private IArangoDatabase Database { get; }

        /// <summary>
        /// Constructor del controlador, es llamado cada vez que se genera la clase que es cuando ASP.NET Core necesite
        /// invocar a un método de esta clase, este constructor recibe 2 parametros que le son brindados
        /// mediante la inyección de dependencias que realiza ASP.NET Core, estos 2 parametros son utilizados
        /// para la inicialización de las propiedades de la clase
        /// </summary>
        /// <param name="notificationHub"></param>
        /// <param name="database"></param>
        /// <param name="projectReadOnlyHub"></param>
        public ProjectsController(IHubContext<NotificationHub> notificationHub, 
            IArangoDatabase database,
            IHubContext<ReadOnlyProjectHub, IReadOnlyClient> projectReadOnlyHub)
        {
            ReadOnlyGroupHub = projectReadOnlyHub;
            Database = database;
            NotificationHub = notificationHub;
        }

        /// <summary>
        /// Método que se encarga de manejar el método GET en la ruta "api/projects", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada previamente; el valor devuelto por este método es un
        /// código HTTP 200 junto con la lista de todos los proyectos a los que pertenece el usuario con la sesión iniciada,
        /// para ello realiza una busqueda utilizando grafos para checar todos los grupos a los que pertenece el usuario y al final
        /// filtrar utilizando la propiedad "isRoot" de "Group" que indica si un grupo es una raíz
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetUserProjects()
        {
            // query a la base de datos
            var projects = await Database.CreateStatement<dynamic>(
                    $"LET projects = (FOR v in 1 OUTBOUND 'User/{HttpContext.User.Identity.Name}'" +
                    $" GRAPH 'GroupUsersGraph' PRUNE v.isRoot == true FILTER" +
                    " v.isRoot == true return " +
                    "merge(v, {projectOwner: " +
                    "DOCUMENT(CONCAT('User/', v.groupOwner)).username}))" +
                    @"FOR p in projects
                return {name: p.name, projectOwner: p.projectOwner, id: p._key}")
                .ToListAsync();

            // lista de proyectos a devolver
            return Ok(new
            {
                projects
            });
        }

        /// <summary>
        /// Método que se encarga de manejar el método POST en la ruta "api/projects", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente y recibe como parametro un objeto de tipo
        /// ProjectCreationData, que contiene nombre e integrantes del futuro proyecto; el valor devuelto por este método es un código
        /// HTTP 201 junto con la ruta para manejar el proyecto si se realizo correctamente,
        /// 401 si no existe el usuario en cuestión o 400 si alguno de los usuarios
        /// con los que se pretende crear el usuario no existe, el proceso realizado por este método consiste en:
        /// verificar si el usuario con el que se realiza la petición existe, una vez verificado esto, que los miembros
        /// dados en la petición hayan sido correctos, después se verifica si el usuario actual se añadió a si mismo en la lista
        /// de miembros ya que el se agregará por separado como administrador, después crea el proyecto
        /// y crea un tablero kanban, luego inserta a los miembros del nuevo proyecto, empezando por el administrador del proyecto que
        /// es el usuario que realiza la petición y envía una notificación a los miembros que fueron agregados
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreationData data)
        {
            var db = Database;

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
                KanbanBoards = new List<KanbanBoard> {new KanbanBoard(data.Name)},
                Events = new List<CalendarEvent>(),
                PreviousProject = data.PreviousProject
            };

            // Default kanban creation
            projectGroup.KanbanBoards[0].Members = await usersToAdd.Select(u => new Models.Kanban.KanbanGroupMember
            {
                UserId = u.Key
            }).ToListAsync();

            projectGroup.KanbanBoards[0].Members.Add(new Models.Kanban.KanbanGroupMember
            {
                UserId = currentUser.Key,
                MemberPermissions = Models.Kanban.KanbanMemberPermissions.Admin
            });

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
                
                var notification = new Notification
                {
                    Read = false,
                    Message = notificationMessage,
                    Priority = NotificationPriority.Medium,
                    Context = $"project/{createdGroup.Key}"
                };

                // enviar la notificación
                await NotificationHub.Clients
                    .Group("Users/" + user.Key)
                    .SendAsync("notificationReceived", notification);

                user.Notifications.Add(notification);
                await db.UpdateByIdAsync<User>(user.Id, user);
            }

            return Created("/api/projects/" + createdGroup.Key, null);
        }

        /// <summary>
        /// Método que se encarga de manejar el método GET en la ruta "api/projects/{id}", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente y recibe como parametro la cadena de texto "id"
        /// a través de la ruta, regresa un código HTTP 404 si el proyecto no existe o si no pertenece al proyecto, en caso
        /// contrario regresa un 200 HTTP junto con la información del proyecto y sus subgrupos acomodados de una manera
        /// jerárquica que obtiene gracias al método recursivo "GetSubgroupHierarchy" que itera sobre todos los subgrupos.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(string id)
        {
            var db = Database;

            // se obtiene una referencia al proyecto con el id brindado
            var project = await (from p in db.Query<Group>()
                where p.Key == id && p.IsRoot
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
            var enumerable = members.ToList();
            if (enumerable.Where(u => u.Key == HttpContext.User.Identity.Name).Count() == 0)
            {
                return NotFound();
            }

            var subgroups = GetSubgroupHierarchy(project.Key);

            var returnMessage = new
            {
                Id = project.Key,
                project.Name,
                project.Description,
                project.GroupOwner,
                project.CreationDate,
                members = enumerable,
                subgroups
            };
            return Ok(returnMessage);
        }

        /// <summary>
        /// Método que se encarga de manejar el método GET en la ruta "api/projects/{projectId}/members", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente, su función es devolver la lista total de integrantes
        /// de un proyecto, para ello realiza un recorrido por grafos a través de todos los grupos y regresa la información
        /// de los usuarios que no este repetida, en caso de que el grupo dado no exista, se devuelve un código HTTP 404
        /// </summary>
        /// <param name="projectId"></param>
        /// <returns></returns>
        [HttpGet("{projectId}/members")]
        public async Task<IActionResult> GetAllProjectMembers(string projectId)
        {
            var users = await Database.CreateStatement<User>($@"
                            FOR g in 0..10000 ANY 'Group/{projectId}' Graph 'SubgroupGraph' 
                                FOR c in 1 INBOUND g._id GRAPH 'GroupUsersGraph'
                                    return DISTINCT c").ToListAsync();

            if (users.Find(u => u.Key == HttpContext.User.Identity.Name) == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                Members = users.Where(u => u != null).Select(u => new
                {
                    u.Key,
                    u.Description,
                    u.Username,
                    u.Birthday,
                    u.Email
                })
            });
        }

        [HttpPut("{projectId}/finish")]
        public async Task<IActionResult> FinishProject(string projectId)
        {
            var group = await Database.Collection("Group").DocumentAsync<Group>(projectId);
            if (group == null || !group.IsRoot || !await Database.IsAdmin(HttpContext.User.Identity.Name, projectId))
            {
                return StatusCode(404);
            }

            group.Finished = !group.Finished;
            await ReadOnlyGroupHub.Clients.Group($"GroupReadOnly/{projectId}").SetReadOnlyValue(group.Finished);
            await Database.UpdateByIdAsync<Group>(group.Id, group);
            return Ok();
        }
        
        #region Requirements

        /// <summary>
        /// Método que se encarga de manejar el método GET en la ruta "api/projects/{projectId}/requirements", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente, recibe como paremetro "projectId" a través de la ruta,
        /// devuelve un código HTTP 200 en caso de que no haya errores del usuario, un 401 si el usuario no pertenece a ese
        /// grupo y un 404 si no existe el proyecto o el _proyecto_ tiene la propiedad isRoot marcada como falsa, el proceso que realiza consiste
        /// en buscar inicialmente si el usuario pertenece al proyecto, si no pertenece termina el método con un Unauthorized, en caso de que pertenezca
        /// busca si la id brindada corresponde a un proyecto, si no corresponde termina el método con un NotFound, en caso de que si sea un
        /// proyecto, regresa la lista de los requerimientos, tanto funcionales como no funcionales
        /// </summary>
        /// <param name="projectId"></param>
        /// <returns></returns>
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
        
        
        /// <summary>
        /// Método que se encarga de manejar el método POST en la ruta "api/projects/{projectId}/requirements", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente, recibe como parametros el id del proyecto y un objeto de tipo
        /// CreateRequirementRequest que contiene una descripción y un tipo, siendo tipo funcional o no funcional, este método
        /// inicialmente verifica que el usuario pertenezca al proyecto y que sea administrador, si no es ninguna de estás dos
        /// el método devuelve un código HTTP 404, en caso contrario crea el requerimiento, lo inserta en la base de datos
        /// y devuelve un código HTTP 201 con la ruta del requerimiento
        /// </summary>
        /// <param name="projectId"></param>
        /// <param name="request"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Método que se encarga de manejar el método GET en la ruta "api/projects/{projectId}/requirements/{requirementId}", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente, recibe dos parametros, el id del proyecto y el id del requerimiento,
        /// este método inicia su ejecución verificando si el usuario pertenece al proyecto, si la id del proyecto brindada
        /// es un proyecto y no un grupo y finalmente si el requerimiento existe, en caso de que no se cumplan se devuelve
        /// un código HTTP 401, un 404 y un 404 respectivamente, en caso de que se cumplan las 3 condiciones se regresa un código HTTP
        /// 200 junto con los datos del requerimiento
        /// </summary>
        /// <param name="projectId"></param>
        /// <param name="requirementId"></param>
        /// <returns></returns>
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
        [HttpGet("{projectId}/requirements/{requirementId}/progress")]
        public async Task<IActionResult> GetRequirementProgress(string projectId, string requirementId)
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

            var requirementProgress = Database.CreateStatement<int>(
                $@"LET tasksWithContributionPercentage = (FOR c, v in 1..1 INBOUND 'Requirements/{requirementId}'
 GRAPH 'TasksReferencingRequirementsGraph'
  FILTER v.contributionPercentage != null
 return {{c: c, v: v}})

LET tasksWithoutContributionPercentage = (FOR c, v in 1..1 INBOUND 'Requirements/{requirementId}'
 GRAPH 'TasksReferencingRequirementsGraph'
  FILTER v.contributionPercentage == null
 return {{c: c, v: v}})

LET tasksWithPercentage = SUM(FOR t in tasksWithContributionPercentage
  FILTER t.v.contributionPercentage != null
 return (t.c.progress * t.v.contributionPercentage) / 100)

LET totalContributionPercentage = SUM(FOR t in tasksWithContributionPercentage return t.v.contributionPercentage)


LET tasksWithoutPercentage = SUM(FOR t in tasksWithoutContributionPercentage
 return (t.c.progress * ((100 - totalContributionPercentage) / LENGTH(tasksWithoutContributionPercentage))) / 100)


return tasksWithoutPercentage + tasksWithPercentage").ToList().FirstOr(0);
            return Ok(requirementProgress);
        }
        
        /// <summary>
        /// Método que se encarga de manejar el método DELETE en la ruta "api/projects/{projectId}/requirements/{requirementId}", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente, recibe dos parametros a través de la ruta, "projectId"
        /// y "requirementId", el método realiza inicialmente una comprobación de que el usuario que realiza la petición es administrador
        /// del proyecto con el identificador brindado y que el requerimiento exista, en caso de que no se cumplan devuelve un código
        /// HTTP 404, en caso contrario obtiene una referencia a el grafo "GroupRequirementGraph" y elimina el requerimiento del grafo
        /// </summary>
        /// <param name="projectId"></param>
        /// <param name="requirementId"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Método que se encarga de manejar el método PUT en la ruta "api/projects/{projectId}/requirements/{requirementId}", es invocado por ASP.NET Core
        /// cuando recibe una petición en la ruta mencionada anteriormente, recibe dos parametros a través de la ruta, "projectId"
        /// y "requirementId", el método comprueba si el usuario que realizó la petición es administrador y que el requerimiento exista, sino
        /// devuelve un código http 404, en caso contrario busca el requerimiento en la base de datos, actualiza la información y devuelve
        /// un código HTTP 200
        /// </summary>
        /// <param name="projectId"></param>
        /// <param name="requirementId"></param>
        /// <param name="request"></param>
        /// <returns></returns>
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

        #region Helper methods

        /// <summary>
        /// Método auxiliar que es invocado por "GetProject" y por si mismo, su tarea es obtener una estructura
        /// jerárquica de todos los subgrupos de un proyecto, para ello obtiene la estructura jerárquica de los subgrupos
        /// hasta que no haya ninguno, el método devuelve un arreglo con los subgrupos del grupo con el identificador brindado (projectId)
        /// </summary>
        /// <param name="projectId"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Obtiene todos los miembros de un grupo, es invocado por "GetSubgroupHierarchy", 
        /// </summary>
        /// <param name="projectId"></param>
        /// <returns></returns>
        private UserGroupView[] GetGroupMembers(string projectId)
        {
            var traversal = Database.Traverse<User, UsersInGroup>(new TraversalConfig
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

        /// <summary>
        /// Obtiene todos los subgrupos de un grupo con determinado id (groupId), este método es auxiliar de
        /// "GetSubgroupHierarchy", por lo tanto es invocado por este, el proceso que realiza es realizar una busqueda
        /// utilizando grafos de los usuarios que están conectados con el grupo con el id "groupId", devuelve una estructura
        /// jerárquica de los subgrupos directos del subgrupo con el id proporcionado
        /// </summary>
        /// <param name="groupId"></param>
        /// <returns></returns>
        private GroupHierarchy[] GetSubgroups(string groupId)
        {
            var subgroups = Database.Traverse<Group, Subgroup>(new TraversalConfig
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

        #endregion
    }
}