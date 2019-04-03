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
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Chat/{groupName}");
        }

        public async Task DisconnectFromGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Chat/{groupName}");
        }
    }
}