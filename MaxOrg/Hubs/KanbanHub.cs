using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Hubs.Clients;
using MaxOrg.Hubs.Requests;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MaxOrg.Hubs
{
    [Authorize]
    public class KanbanHub : Hub<IKanbanClient>
    {
        private IArangoDatabase Database;

        public KanbanHub(IArangoDatabase database)
        {
            Database = database;
        }
        
        public async Task JoinGroup(JoinKanbanHubRequest request)
        {
            var group = await (from g in Database.Query<Group>()
                where g.Key == request.GroupId
                select g).FirstOrDefaultAsync();
            if (group == null)
            {
                Context.Abort();
                return;
            }

            var kanbanBoard = (from kb in @group.KanbanBoards where kb.Id == request.BoardId select kb).FirstOrDefault();
            if (kanbanBoard == null)
            {
                Context.Abort();
                return;
            }

            var memberData = kanbanBoard.Members.Find(km => km.UserId == Context.User.Identity.Name);
            if (memberData == null)
            {
                Context.Abort();
                return;
            }


            await Groups.AddToGroupAsync(Context.ConnectionId, $"Group/${request.GroupId}/Kanban/${request.BoardId}");
        }
    }
}