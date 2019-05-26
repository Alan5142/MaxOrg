using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Login
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class RefreshToken
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key;

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id;
        public string Token;
        public DateTime IssuedAt = DateTime.UtcNow;
        public DateTime Expires;
        public string UserKey;
    }
}