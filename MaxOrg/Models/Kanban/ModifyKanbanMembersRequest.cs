using System.Collections.Generic;

namespace MaxOrg.Models.Kanban
{
    public class ModifyKanbanMembersRequest
    {
        public List<NewMember> NewMembers { get; set; }
    }
}