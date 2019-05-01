using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models.Kanban
{
    public class CreateSectionRequest
    {
        [Required]
        public string Name { get; set; }
    }
}
