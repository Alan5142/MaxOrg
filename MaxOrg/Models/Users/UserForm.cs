using System;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Users
{
    public class UserForm
    {
        [StringLength(maximumLength: 20, MinimumLength = 7)]
        [Required]
        public string Username { get; set; }

        [Required] [EmailAddress] public string Email { get; set; }

        [Required]
        [StringLength(maximumLength: 100, MinimumLength = 8)]
        public string Password { get; set; }

        public string RealName { get; set; }
        public string Description { get; set; }
        public string Occupation { get; set; }
        public DateTime? Birthday { get; set; }
    }
}