using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Requirements
{

    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "Requirements")]
    public class Requirement
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        public string Description { get; set; }
        
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        
        public RequirementType RequirementType { get; set; }
    }
}
