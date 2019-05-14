using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Users
{
    public class ExternalRegister
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public string ProfileUrl { get; set; }
        [Required]
        public string UserId { get; set; }
    }
}