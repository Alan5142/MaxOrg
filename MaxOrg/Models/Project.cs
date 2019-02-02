using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    public class ProjectCreationData
    {
        [Required]
        public string Name { get; set; }
        public List<string> Members { get; set; }
    }

}
