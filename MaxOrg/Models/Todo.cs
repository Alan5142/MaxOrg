using System;
using ArangoDB.Client;

namespace MaxOrg.Models
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Todo
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime? AssignedDate { get; set; } = null;
        public short Progress { get; set; } = 0;
    }
}
