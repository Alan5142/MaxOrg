using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Tasks
{
    public class CreateTaskRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }

        public string DeliveryDate { get; set; }
        public string ReferenceRequirement { get; set; } = null;
        public string ReferenceTask { get; set; } = null;

        public short? ContributionPercentage { get; set; }
    }
}