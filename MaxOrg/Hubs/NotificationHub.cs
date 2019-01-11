using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Hubs
{
    public class NotificationHub : Hub
    {
        private async Task SendNotification(string user, string notification)
        {
            await Clients.All.SendAsync("ReceiveNotification", user, notification);
        }

        public async Task JoinNotificationGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        [Authorize]
        public async Task ConnectToHub()
        {
            var name = Context.User.Identity.Name;
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName: "Users/" + name);
        }
    }
}
