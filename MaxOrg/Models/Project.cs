using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models
{
    public class ProjectCreationData
    {
        [Required] public string Name { get; set; }
        public List<string> Members { get; set; }

        public string PreviousProject { get; set; } = null;
    }
}