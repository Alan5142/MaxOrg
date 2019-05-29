using System.Threading.Tasks;
using MaxOrg.Hubs.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MaxOrg.Hubs
{
    [Authorize]
    public class ReadOnlyProjectHub : Hub<IReadOnlyClient>
    {
        public async Task JoinGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"GroupReadOnly/{groupId}");
        }
    }
}