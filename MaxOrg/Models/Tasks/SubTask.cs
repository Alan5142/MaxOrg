using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Tasks
{
    
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "SubTasks")]
    public class SubTask
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }
        
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string ChildTask { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string ParentTask { get; set; }
        
        public DateTime AssignmentDate { get; set; } = DateTime.UtcNow;
    }
}