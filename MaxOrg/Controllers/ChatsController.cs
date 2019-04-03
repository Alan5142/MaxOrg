using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Graphs;
using MaxOrg.Hubs;
using MaxOrg.Models;
using MaxOrg.Requests.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MaxOrg.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ChatsController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _chatHub;
        private readonly IHubContext<NotificationHub> _notificationHub;
        public ChatsController(IHubContext<ChatHub> chatHub, IHubContext<NotificationHub> notificationHub)
        {
            _chatHub = chatHub;
            _notificationHub = notificationHub;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetIdentifiedUserChats([FromQuery] string projectId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await db.Query<User>()
                    .Where(u => u.Key == HttpContext.User.Identity.Name)
                    .Select(u => u).FirstOrDefaultAsync();
                
                if (user == null)
                {
                    return NotFound();
                }
                
                var groupChats = await db.CreateStatement<Chat>(@"
                    LET chat = (FOR c in 1..1 INBOUND" + $"'{user.Id}'" + @"
                     GRAPH 'ChatsUsersGraph'
                     return c)
                     FOR c in chat
                     FILTER c.isGroup == true FILTER c.projectId == " + $"'{projectId}'" + @"
                    
                    LET messages = (
                    FOR m in c.messages
                    FOR u in User
                    FILTER m.remitent == u._key
                    return MERGE(m, {remitent: u.username})
                    )
                    return MERGE(c, {messages: messages})
                ").ToListAsync();
                
                var pairChats = await db.CreateStatement<Chat>(@"
                    LET chat = (FOR c in 1..1 INBOUND" + $"'{user.Id}'" + @"
                     GRAPH 'ChatsUsersGraph'
                     return c)
                     FOR c in chat
                     FILTER c.isGroup == false FILTER c.projectId == " + $"'{projectId}'" + @"
                    
                    LET messages = (
                    FOR m in c.messages
                    FOR u in User
                    FILTER m.remitent == u._key
                    return MERGE(m, {remitent: u.username})
                    )
                    return MERGE(c, {messages: messages})
                ").ToListAsync();
                
                return Ok(new{groupChats, pairChats});
            }
        }
        
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
                
                var chat = new Chat
                {
                    Name = request.Name,
                    Messages = new List<Message>(),
                    IsGroup = request.IsGroup,
                    ProjectId = request.ProjectId
                };

                var usersInChatGraph = db.Graph("ChatsUsersGraph");
                
                var createdChat = await db.InsertAsync<Chat>(chat);
                
                var userToAdd = new ChatMembers
                {
                    Chat = createdChat.Id,
                    User = user.Id
                };

                await usersInChatGraph.InsertEdgeAsync<ChatMembers>(userToAdd);
                var notificationMessage =
                    $"${user.Username} te ha agregado al chat ${chat.Name} en el proyecto ${group.Name}";
                foreach (var userId in request.Members)
                {
                    userToAdd = new ChatMembers
                    {
                        Chat = createdChat.Id,
                        User = $"User/{userId}"
                    };
                    
                    await usersInChatGraph.InsertEdgeAsync<ChatMembers>(userToAdd);
                    
                    await _notificationHub.Clients
                        .Group($"User/{userId}")
                        .SendAsync("notificationReceived", notificationMessage);
                }

                return Ok();
            }
        }
        
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
                                FILTER m.remitent == u._key
                                return MERGE(m, {remitent: u.username})
                            )
                    return MERGE(c, {messages: messages})"
                ).ToListAsync()).Select(c => new{c.Key, c.Name, c.Messages, c.IsGroup, c.Description, c.ProjectId});
                
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

        [HttpPost("{chatId}/messages")]
        public async Task<IActionResult> SendMessage(string chatId, SendMessageRequest request)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var chat = await db.Query<Chat>()
                    .Where(c => c.Key == chatId)
                    .Select(c => c).FirstOrDefaultAsync();
                chat.Messages.Add(new Message()
                {
                    Type = MessageType.Text,
                    Data = request.Message,
                    Remitent = HttpContext.User.Identity.Name,
                    Date =  DateTime.Now
                });

                await _chatHub.Clients.Group(chat.Id).SendAsync("receiveMessage", request.Message);
                
                await db.UpdateByIdAsync<Chat>(chat.Id, chat);
                return Ok();
            }
        }

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
