using System;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models.Calendar
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Event
    {
        public string Id { get; set; } = ShortId.Generate(true, false, 14);

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        
        public DateTime EventDate { get; set; }

        public string Title { get; set; } = "";

        public string Description { get; set; } = "";
        
        public EventPriority Priority { get; set; } = EventPriority.Low;
        
        public string CreatorId { get; set; }

        public bool OnlyForMe { get; set; } = true;
    }
}