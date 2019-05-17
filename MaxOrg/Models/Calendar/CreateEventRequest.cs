using System;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Calendar
{
    public class CreateEventRequest
    {
        [Required] public string Title { get; set; }
        
        [Required] public string Description { get; set; }

        [Required] public EventPriority Priority { get; set; } = EventPriority.Low;

        [Required] public bool OnlyForMe { get; set; } = true;
        
        [Required] public DateTime EventDate { get; set; }
    }
}