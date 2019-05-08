using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models;
using MaxOrg.Models.Group;

namespace MaxOrg.Utility
{
    public static class GroupHelpers
    {
        public static async Task<Group> GetRootGroup(this IArangoDatabase database, string groupId)
        {
            var groups = database.CreateStatement<Group>($@"
                                FOR g in 0..10000 INBOUND 'Group/{groupId}' Graph 'SubgroupGraph' 
                                PRUNE g.isRoot == true 
                                FILTER g.isRoot == true
                                RETURN g");

            return (await groups.ToListAsync()).FirstOrDefault();
        }
    }
}