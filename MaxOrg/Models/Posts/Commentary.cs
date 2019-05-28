using System;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models.Posts
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Commentary
    {
        public string Id = ShortId.Generate(true, false, 20);
        public string CreatorId { get; set; }
        public string Content { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}