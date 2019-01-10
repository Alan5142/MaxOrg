using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    public class User
    {
        public User()
        {
        }

        public User(UserForm userModel)
        {
            username = userModel.username;
            email = userModel.email;
            password = userModel.password;
            realName = userModel.realName;
            description = userModel.description;
            occupation = userModel.occupation;
            birthday = userModel.birthday ?? DateTime.MinValue;
        }

        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string key { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string salt { get; set; }
        public string realName { get; set; }
        public string description { get; set; }
        public string occupation { get; set; }
        public DateTime birthday { get; set; } = DateTime.MinValue;
        public int? githubId { get; set; }
        public string githubToken { get; set; }
    }

    public class UserForm
    {
        [StringLength(maximumLength: 20,MinimumLength = 7)]
        [Required]
        public string username { get; set; }
        [Required]
        [EmailAddress]
        public string email { get; set; }
        [Required]
        [StringLength(maximumLength: 100, MinimumLength = 8)]
        public string password { get; set; }
        public string realName { get; set; }
        public string description { get; set; }
        public string occupation { get; set; }
        public DateTime? birthday { get; set; }
    }

    public class UserUpdateInfo
    {
        [StringLength(maximumLength: 20, MinimumLength = 7)]
        public string username { get; set; }
        [EmailAddress]
        public string email { get; set; }
        [StringLength(maximumLength: 100, MinimumLength = 8)]
        public string password { get; set; }
        public string realName { get; set; }
        public string description { get; set; }
        public string occupation { get; set; }
        public DateTime? birthday { get; set; }
    }
}
