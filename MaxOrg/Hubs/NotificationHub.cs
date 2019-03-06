using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MaxOrg.Hubs
{
    public enum NotificationReceiverType
    {
        User,
        Group
    }

    public class NotificationRequest
    {
        public string Message { get; set; }
        public NotificationReceiverType ReceiverType { get; set; }

        public string[] UsersOrGroups { get; set; }
    }

    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task SendNotificationToUser(string user, string notification)
        {
            await Clients.Group("User/" + user).SendAsync("notificationReceived", notification);
        }

        public async Task JoinNotificationGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task ConnectToHub()
        {
            var name = Context.User.Identity.Name;
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName: "Users/" + name);
        }
    }
}