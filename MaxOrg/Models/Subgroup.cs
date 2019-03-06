using ArangoDB.Client;
using System;

namespace MaxOrg.Models
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Subgroup
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string Parent { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Child { get; set; }
    }
}