using ArangoDB.Client;

namespace MaxOrg.Graphs
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class ChatMembers
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }
        
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string Chat { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string User { get; set; }
    }
}
