using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MaxOrg.Models.Users
{
    public class UserUpdateInfo
    {
        [StringLength(maximumLength: 100, MinimumLength = 8)]
        public string Password { get; set; } = null;

        public string RealName { get; set; } = null;
        public string Description { get; set; } = null;
        public string Occupation { get; set; } = null;
        public DateTime? Birthday { get; set; } = null;

        public IFormFile ProfilePicture { get; set; } = null;
        
        public string ProfilePictureAsBase64 { get; set; } = null;
        
        public NotificationPreference? Preferences { get; set; }
    }
}