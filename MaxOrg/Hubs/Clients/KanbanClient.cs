using System.Threading.Tasks;

namespace MaxOrg.Hubs.Clients
{
    public interface IKanbanClient
    {
        Task UpdateBoard();
    }
}