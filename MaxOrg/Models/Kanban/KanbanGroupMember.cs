using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models.Kanban
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanGroupMember
    {
        public string UserId { get; set; } = string.Empty;
        public KanbanMemberPermissions MemberPermissions { get; set; } = KanbanMemberPermissions.Read;
    }
}
