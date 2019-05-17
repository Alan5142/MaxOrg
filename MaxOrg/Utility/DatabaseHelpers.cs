using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models.Group;
using Microsoft.EntityFrameworkCore.Internal;

namespace MaxOrg.Utility
{
    public static class DatabaseHelpers
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

        public static async Task<bool> IsGroupMember(this IArangoDatabase database, string userId, string groupId)
        {
            if (groupId == null || userId == null)
            {
                return false;
            }
            var group = await database.Collection("Group").DocumentAsync<Group>(groupId);
            if (group == null)
            {
                return false;
            }

            var isMember = await database.CreateStatement<bool>(
                $@"return (FOR v in 1 INBOUND 'Group/288872' Graph 'GroupUsersGraph' 
FILTER v._key == '{userId}'
return v) != []").ToListAsync();

            return isMember.FirstOr(false) || await database.IsAdmin(userId, groupId);
        }

        public static async Task<bool> IsAdmin(this IArangoDatabase database, string userId, string groupId)
        {
            var result = await database.CreateStatement<bool>(
                $@"LET isAdmin = (FOR v in 0..5000 INBOUND 'Group/{groupId}' Graph 'SubgroupGraph' 
PRUNE v.groupOwner == '{userId}' FILTER v.groupOwner == '{userId}' return v)
return isAdmin != []").ToListAsync();
            return result.Count != 0 && result[0];
        }
    }
}