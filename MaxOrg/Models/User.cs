using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    public class User
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string key { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string description { get; set; }
        public string occupation { get; set; }
        public DateTime birthday { get; set; }
    }
}
