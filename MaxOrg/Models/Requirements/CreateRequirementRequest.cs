using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Requirements
{
    public class CreateRequirementRequest
    {
        [Required]
        public string Description { get; set; }
        
        [Required]
        public RequirementType Type { get; set; }
    }
}