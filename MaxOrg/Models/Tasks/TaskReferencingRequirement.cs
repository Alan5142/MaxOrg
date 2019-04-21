using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Tasks
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "TasksReferencingRequirements")]
    public class TaskReferencingRequirement
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }
        
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string ToDoTask { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Requirement { get; set; }
        
        public DateTime ReferencingDate { get; set; } = DateTime.UtcNow;

        public short? ContributionPercentage { get; set; }
    }
}
