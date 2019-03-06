using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ILogger m_logger;

        public ChatHub(ILogger logger)
        {
            m_logger = logger;
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task SendMessage(string groupName, string message, MessageType type)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var chatGroup = await (from chat in db.Query<Chat>()
                    where chat.Name == groupName
                    select chat).FirstOrDefaultAsync();

                var messageToAdd = new Message
                {
                    Remitent = Context.User.Identity.Name,
                    Date = DateTime.Now,
                    Type = type,
                    Data = message
                };

                if (chatGroup == null)
                {
                    m_logger.LogError("Somebody tried to send a message to a non existing chat");
                    return;
                }

                chatGroup.Messages.Add(messageToAdd);
                await Clients.Group(groupName).SendAsync("OnReceiveMessage", messageToAdd);
            }
        }
    }
}