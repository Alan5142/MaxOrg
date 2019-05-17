using System;

namespace MaxOrg.Models.Calendar
{
    public class ModifyEventRequest
    {
        public string Title { get; set; }
        
        public string Description { get; set; }

        public EventPriority? Priority { get; set; }

        public bool? OnlyForMe { get; set; } = true;
        
        public DateTime? EventDate { get; set; }
    }
}