using System.Threading.Tasks;

namespace MaxOrg.Hubs.Clients
{
    public interface IReadOnlyClient
    {
        Task SetReadOnlyValue(bool value);
    }
}