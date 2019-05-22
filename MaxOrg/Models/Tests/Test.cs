using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Tests
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "Tests")]
    public class Test
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        public int BuildId { get; set; }
        
        public int? Succeeded { get; set; } = null;
        public int? Failed { get; set; } = null;

        public string Description { get; set; } = null;

        public string Name { get; set; } = null;
        
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}