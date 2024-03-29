﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Graphs;
using MaxOrg.Hubs;
using MaxOrg.Models.Chats;
using MaxOrg.Models.Group;
using MaxOrg.Models.Notifications;
using MaxOrg.Models.Users;
using MaxOrg.Requests.Chat;
using MaxOrg.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage.Blob;
using shortid;

namespace MaxOrg.Controllers
{
    /// <summary>
    /// Clase que se encarga de gestionar la creación y modificación de chats, así como también de enviar mensajes a determinados chats.
    /// Para que se puedan acceder a los métodos HTTP de esta clase es necesario que el usuario este autenticado, de lo contrario ASP.NET Core responderá con un mensaje
    /// vacio y un código de error 401 (Unauthorized). La ruta base de todos los métodos de esta clase es: /api/chats y las rutas de los métodos de la clase son relativas
    /// a esta ruta
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ChatsController : ControllerBase
    {
        /// <summary>
        /// Contiene los datos del Hub SignalR del chat, el hub de chat nos permite mantener una comunicación en tiempo real entre el cliente y el servidor
        /// </summary>
        private readonly IHubContext<ChatHub> _chatHub;

        /// <summary>
        /// Contiene los datos del Hub SignalR de las notificaciones, con esto podemos enviar una notificación en caso de que un usuario haya sido agregado a un chat
        /// </summary>
        private IHubContext<NotificationHub> NotificationHub { get; }

        private IArangoDatabase Database { get; }

        private CloudBlobContainer BlobContainer { get; }

        private IConfiguration Configuration { get; }

        /// <summary>
        /// Constructor de ChatsController, recibe dos parametros, uno de ellos es una referencia al ChatHub de SignalR y el otro una referencia
        /// al NotificationHub de SignalR, ambos son inyectados por ASP.NET Core
        /// </summary>
        /// <param name="chatHub"></param>
        /// <param name="notificationHub"></param>
        /// <param name="database"></param>
        /// <param name="blobContainer"></param>
        public ChatsController(IHubContext<ChatHub> chatHub, IHubContext<NotificationHub> notificationHub,
            IArangoDatabase database, CloudBlobContainer blobContainer, IConfiguration configuration)
        {
            Configuration = configuration;
            BlobContainer = blobContainer;
            Database = database;
            _chatHub = chatHub;
            NotificationHub = notificationHub;
        }

        /// <summary>
        /// Obtiene los chats a los que pertenece un usuario en determinado proyecto.
        /// Lo que hace el método es conectarse a la base de datos y buscar al usuario actual, si no existe entonces devuelve un código HTTP 404, en caso de que exista
        /// procede a buscar los chats grupales e individuales a los que pertenece el usuario actual y los devuelve con un código HTTP 200
        /// </summary>
        /// <param name="projectId"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetIdentifiedUserChats([FromQuery] string projectId)
        {
            if (projectId == null)
            {
                return BadRequest();
            }
            
            // Buscamos al usuario
            var user = await Database.Query<User>()
                .Where(u => u.Key == HttpContext.User.Identity.Name)
                .Select(u => u).FirstOrDefaultAsync();

            // Si es nulo entonces retornamos un "NotFound" (Http 404)
            if (user == null)
            {
                return NotFound();
            }

            var rootGroup = await Database.GetRootGroup(projectId);

            // Busqueda en la base de datos que obtiene los chats grupales a los que pertenece un usuario
            var groupChats = await Database.CreateStatement<dynamic>($@"
            FOR c in 1..1 INBOUND '{user.Id}'
                GRAPH 'ChatsUsersGraph'
                FILTER c.isGroup == true
                FILTER c.projectId == '{rootGroup.Key}'
                return {{key: c._key, id: c._id, projectId: c.projectId, name: c.name, description: c.description}}")
                .ToListAsync();

            // Busqueda en la base de datos que obtiene los chats individuales a los que pertenece un usuario
            var pairChats = await Database.CreateStatement<dynamic>($@"
            FOR c in 1..1 INBOUND '{user.Id}'
                GRAPH 'ChatsUsersGraph'
                FILTER c.isGroup == false
                FILTER c.projectId == '{rootGroup.Key}'
                return {{key: c._key, id: c._id, projectId: c.projectId, name: c.name, description: c.description}}")
                .ToListAsync();

            // Devolvemos un "Ok" (Http 200) junto con los chats grupales y los chats entre 2 personas
            return Ok(new {groupChats, pairChats});
        }

        /// <summary>
        /// Crea un chat con los integrantes y el nombre que desee el usuario, además de especificar si es un chat grupal o uno individual.
        /// Este método recibe un solo parametro, que es el modelo de la petición Http, el modelo esta definido anteriormente, la acción que realiza esté método es
        /// obtiener el usuario actual, que es el que esta creando el chat y el proyecto en el que se desea crear el chat, en caso de que alguno de los dos
        /// no exista, el método devolverá un código HTTP 404, en caso contrario creara un nuevo chat y creará un vinculo mediante grafos entre el proyecto y el
        /// chat y entre el chat y los miembros del chat, una vez hecho esto, se devolverá un código HTTP 200.
        /// Este método solo soporta POST y se accede desde la ruta de ChatsController
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateChat(CreateChatRequest request)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await db.Query<User>()
                    .Where(u => u.Key == HttpContext.User.Identity.Name)
                    .Select(u => u)
                    .FirstOrDefaultAsync();
                var group = await db.Query<Group>()
                    .Where(g => g.Key == request.ProjectId)
                    .Select(g => g)
                    .FirstOrDefaultAsync();
                if (user == null || group == null)
                {
                    return BadRequest();
                }

                var rootGroup = await Database.GetRootGroup(request.ProjectId);

                var chat = new Chat
                {
                    Name = request.Name,
                    Messages = new List<Message>(),
                    IsGroup = request.IsGroup,
                    ProjectId = rootGroup.Key
                };

                var createdChat = await db.InsertAsync<Chat>(chat);

                var usersInChatGraph = db.Graph("ChatsUsersGraph");


                var userToAdd = new ChatMembers
                {
                    Chat = createdChat.Id,
                    User = user.Id
                };

                await usersInChatGraph.InsertEdgeAsync<ChatMembers>(userToAdd);
                var notificationMessage =
                    $"{user.Username} te ha agregado al chat {chat.Name} en el proyecto {group.Name}";

                foreach (var userId in request.Members)
                {
                    var memberUser = Database.Query<User>().Where(u => u.Key == userId).Select(u => u).FirstOrDefault();
                    if (memberUser?.Key == HttpContext.User.Identity.Name) continue;

                    userToAdd = new ChatMembers
                    {
                        Chat = createdChat.Id,
                        User = $"User/{userId}"
                    };

                    await usersInChatGraph.InsertEdgeAsync<ChatMembers>(userToAdd);


                    var notification = new Notification
                    {
                        Read = false,
                        Message = notificationMessage,
                        Priority = NotificationPriority.Medium,
                        Context = $"project/{rootGroup.Key}/messages"
                    };
                    await NotificationHub.Clients
                        .Group($"User/{userId}")
                        .SendAsync("notificationReceived", notification);

                    memberUser?.Notifications.Add(notification);
                    await db.UpdateByIdAsync<User>(memberUser?.Id, memberUser);
                }

                return Ok();
            }
        }

        /// <summary>
        /// Obtiene los datos de determinado chat a través del identificador de ese chat, este método verifica que el usuario que desea acceder a esos datos
        /// pertenezca al chat, para eso realiza un recorrido por medio de grafos, en caso de que no pertenezca regresa un código HTTP 404, por lo contrario,
        /// si el usuario pertenece a ese chat, devolverá un código HTTP 200 junto con los datos del chat
        /// </summary>
        /// <param name="chatId"></param>
        /// <returns></returns>
        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatById(string chatId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var chat = await db.Query<Chat>()
                    .Where(c => c.Key == chatId)
                    .Select(c => c)
                    .FirstOrDefaultAsync();
                if (chat == null)
                {
                    return NotFound();
                }

                var filteredChat = (await db.CreateStatement<Chat>(@"    FOR c in Chat
                    FILTER c._key == " + $"'{chatId}'" + @"
                            LET messages = (
                                FOR m in c.messages
                                FOR u in User
                                FILTER m.sender == u._key
                                return MERGE(m, {sender: u.username, senderId: m.sender})
                            )
                    return MERGE(c, {messages: messages})"
                ).ToListAsync()).Select(c => new {c.Key, c.Name, c.Messages, c.IsGroup, c.ProjectId});

                var traversalResult = await db.TraverseAsync<User, Chat>(new TraversalConfig
                {
                    StartVertex = chat.Id,
                    GraphName = "ChatsUsersGraph",
                    Direction = EdgeDirection.Outbound,
                    MinDepth = 1,
                    MaxDepth = 1
                });
                var chats = traversalResult.Visited.Vertices;
                // si el usuario no esta en ese chat entonces lo descartamos
                if (chats.Find(u => u.Key == HttpContext.User.Identity.Name) == null)
                {
                    return NotFound();
                }

                return Ok(filteredChat.FirstOrDefault());
            }
        }

        /// <summary>
        /// Envía un mensaje, definido en la petición, al chat que cuente con el identificador proporcionado por el usuario, este método obtiene el chat y le añade un mensaje,
        /// posteriormente envía a todos los miembros que esten visualizando ese chat al momento en que se envía el mensaje una señal que indica que recibieron un mensaje y
        /// actualizan la interfaz para reflejar el cambio
        /// </summary>
        /// <param name="chatId"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost("{chatId}/messages")]
        [RequestSizeLimit(10485760)]
        public async Task<IActionResult> SendMessage(string chatId, [FromForm, FromBody] SendMessageRequest request)
        {
            var chat = await Database.Query<Chat>()
                .Where(c => c.Key == chatId)
                .Select(c => c).FirstOrDefaultAsync();
            if (request.Attachment is null && request.Message is null)
            {
                return NotFound();
            }

            Message message;

            if (request.Message != null)
            {
                message = new Message()
                {
                    Type = MessageType.Text,
                    Data = request.Message,
                    Sender = HttpContext.User.Identity.Name,
                    Date = DateTime.UtcNow
                };
            }
            else
            {
                try
                {
                    // id del blob
                    var id = ShortId.Generate(true, false, 30);
                    var blob = BlobContainer.GetBlockBlobReference($"chats/{chatId}/{id}");
                    var messageType = MessageType.Other;
                    var contentType = request.Attachment.ContentType;
                    var stream = request.Attachment.OpenReadStream();

                    // tipo de contenido
                    if (contentType.Contains("video"))
                    {
                        messageType = MessageType.Video;
                    }
                    else if (contentType.Contains("image"))
                    {
                        messageType = MessageType.Image;
                    }

                    await blob.UploadFromStreamAsync(stream);

                    await blob.FetchAttributesAsync();
                    blob.Properties.ContentType = contentType;
                    blob.Properties.CacheControl = "max-age=2419200";
                    await blob.SetPropertiesAsync();
                    message = new Message
                    {
                        Type = messageType,
                        Data = $"/api/chats/{chatId}/messages/attachment/{id}",
                        Sender = HttpContext.User.Identity.Name,
                        Date = DateTime.UtcNow,
                        AttachmentId = id
                    };

                    if (messageType == MessageType.Other)
                    {
                        message.AttachmentName = request.Attachment.FileName;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return StatusCode(500, new {message = "Error uploading file"});
                }
            }


            chat.Messages.Add(message);

            await _chatHub.Clients.Group(chat.Id).SendAsync("receiveMessage", new
            {
                message.Data,
                message.Date,
                message.Type,
                message.AttachmentId,
                message.AttachmentName,
                Sender = (await Database.Collection("User").DocumentAsync<User>(message.Sender)).Username
            });

            await Database.UpdateByIdAsync<Chat>(chat.Id, chat);
            return Ok();
        }

        [HttpGet("{chatId}/messages/attachment/{attachmentId}")]
        public async Task<IActionResult> GetAttachmentData(string chatId, string attachmentId)
        {
            var isMember = Database.CreateStatement<bool>($@"return (FOR u in 1..1 OUTBOUND 'Chat/{chatId}'
                        GRAPH 'ChatsUsersGraph'
                        PRUNE u._key == '{HttpContext.User.Identity.Name}'
                        FILTER u._key == '{HttpContext.User.Identity.Name}'
                        return u) != []").ToList().FirstOr(false);
            if (!isMember)
            {
                return NotFound();
            }

            var blob = BlobContainer.GetBlockBlobReference($"chats/{chatId}/{attachmentId}");
            if (!await blob.ExistsAsync())
            {
                return NotFound();
            }

            var sasConstraints = new SharedAccessBlobPolicy
            {
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(2),
                Permissions = SharedAccessBlobPermissions.Read
            };

            var sasBlobToken = blob.GetSharedAccessSignature(sasConstraints);
            return Ok(new
            {
                Url = blob.Uri + sasBlobToken,
                Mime = blob.Properties.ContentType
            });
        }

        /// <summary>
        /// Añade un usuario, definido en la petición, al chat que cuente con el identificador proporcionado por el usuario que desea agregar otro miembro al chat,
        /// este método crea un vinculo a través de grafos entre el chat al que se le desea agregar un miembro y el miembro que será agregado.
        /// Este método solo acepta POST y esta en la ruta "{chatId}/messages", donde chatId es el identificador del chat.
        /// </summary>
        /// <param name="chatId"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost("{chatId}/users")]
        public async Task<IActionResult> AddUserToChat(string chatId, AddUserToChatRequest request)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var usersInChatGraph = db.Graph("ChatsUserGraph");
                var edge = new ChatMembers {Chat = chatId, User = request.UserId};
                await usersInChatGraph.InsertEdgeAsync<ChatMembers>(edge);
                return Ok();
            }
        }

        /// <summary>
        /// Obtiene todos los miembros del chat con el identificador proporcionado,
        /// este método realiza un recorrido por medio de grafos y obtiene los vertices que sean usuarios que esten directamente conectados al chat, que también es un
        /// vertice
        /// </summary>
        /// <param name="chatId"></param>
        /// <returns></returns>
        [HttpGet("{chatId}/users")]
        public async Task<IActionResult> GetUsersOfChat(string chatId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var group = await db.Query<Chat>()
                    .Where(c => c.Key == chatId)
                    .Select(c => c).FirstOrDefaultAsync();

                if (group == null)
                {
                    return NotFound();
                }

                var traversalResult = await db.TraverseAsync<User, Chat>(new TraversalConfig
                {
                    StartVertex = group.Id,
                    GraphName = "ChatUsersGraph",
                    Direction = EdgeDirection.Outbound,
                    MinDepth = 1,
                    MaxDepth = 1
                });
                var chats = traversalResult.Visited.Vertices;

                var users = chats.Select(u => new {u.Key, u.Username});

                return Ok(users);
            }
        }
    }
}