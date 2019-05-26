using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Tasks
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "ToDoTasks")]
    public class ToDoTask
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public string DeliveryDate { get; set; } = DateTime.UtcNow.Date.ToString("d");
        
        public short Progress { get; set; } = 0;
        
        public DateTime? FinishedDate { get; set; }
    }
}