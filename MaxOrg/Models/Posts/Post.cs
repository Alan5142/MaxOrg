using System;
using System.Collections.Generic;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models.Posts
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Post
    {
        public string Id = ShortId.Generate(true, false, 20);
        
        public string CreatorId { get; set; }
        
        public string Content { get; set; }
        
        public List<Commentary> Comments { get; set; } = new List<Commentary>();
        
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}