using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Group
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class UsersInGroup
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string User { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Group { get; set; }

        public bool IsAdmin { get; set; }

        public DateTime JoinDate { get; set; }

        public string AddedBy { get; set; }
    }
}