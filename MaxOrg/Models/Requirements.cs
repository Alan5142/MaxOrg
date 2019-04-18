using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{

    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Requirement
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        public string Name { get; set; }


        public DateTime CreationDate { get; set; } = DateTime.Now;
    }
}
