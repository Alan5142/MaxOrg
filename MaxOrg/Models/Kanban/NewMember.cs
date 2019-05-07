namespace MaxOrg.Models.Kanban
{
    public class NewMember
    {
        public string User { get; set; } = string.Empty;
        public KanbanMemberPermissions MemberPermissions { get; set; } = KanbanMemberPermissions.Read;
    }
}