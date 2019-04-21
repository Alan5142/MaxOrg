using ArangoDB.Client;

namespace MaxOrg.Models.Requirements
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "GroupRequirements")]
    public class GroupRequirement
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }
        
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string Requirement { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Group { get; set; }
    }
}