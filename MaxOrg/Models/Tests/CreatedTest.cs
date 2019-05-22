using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Tests
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "CreatedTests")]
    public class CreatedTest
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string Group { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Test { get; set; }

        public string CreatorId { get; set; }
        
        public string Description { get; set; }
    }
}