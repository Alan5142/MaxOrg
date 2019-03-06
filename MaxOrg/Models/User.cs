﻿using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class User
    {
        public User()
        {
        }

        public User(UserForm userModel)
        {
            Username = userModel.Username;
            Email = userModel.Email;
            Password = userModel.Password;
            RealName = userModel.RealName;
            Description = userModel.Description;
            Occupation = userModel.Occupation;
            Birthday = userModel.Birthday ?? DateTime.MinValue;
        }

        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Salt { get; set; }
        public string RealName { get; set; }
        public string Description { get; set; }
        public string Occupation { get; set; }
        public DateTime Birthday { get; set; } = DateTime.MinValue;

        [DocumentProperty(IgnoreProperty = true)]
        public int? GithubId { get; set; }

        public string GithubToken { get; set; }

        /// <summary>
        /// Notificaciones que le han llegado al usuario, estan ordenadas de forma cronologica
        /// </summary>
        public List<Notification> Notifications { get; set; } = new List<Notification>();
    }

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

    public class UserUpdateInfo
    {
        [StringLength(maximumLength: 20, MinimumLength = 7)]
        public string username { get; set; }

        [EmailAddress] public string email { get; set; }

        [StringLength(maximumLength: 100, MinimumLength = 8)]
        public string password { get; set; }

        public string realName { get; set; }
        public string description { get; set; }
        public string occupation { get; set; }
        public DateTime? birthday { get; set; }
    }
}