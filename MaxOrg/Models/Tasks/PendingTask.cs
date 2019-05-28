namespace MaxOrg.Models.Tasks
{
    public class PendingTask
    {
        public ToDoTask Task { get; set; }
        public string GroupName { get; set; }
        public string GroupId { get; set; }
        public string Owner { get; set; }
    }
}