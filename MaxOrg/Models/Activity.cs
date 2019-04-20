using ArangoDB.Client;
using shortid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Activity
    {
        public string Name { get; set; }
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);

        public string Details { get; set; }

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public short CompletedPercentaget { get; set; } = 0;
    }
}
