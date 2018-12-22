using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    public class Project
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string key { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string projectOwner { get; set; }
        public string rootGroupId { get; set; }
    }
}
