using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Kanban
{
    public class SwapCardsRequest
    {
        [Required]
        public int PreviousIndex { get; set; }
        [Required]
        public int NewIndex { get; set; }
    }
}