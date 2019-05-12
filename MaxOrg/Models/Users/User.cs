using System;
using System.Collections.Generic;
using ArangoDB.Client;

namespace MaxOrg.Models.Users
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
        
        public int? GithubId { get; set; }

        public string GithubToken { get; set; }
        
        public string GoogleId { get; set; }

        /// <summary>
        /// Notificaciones que le han llegado al usuario, estan ordenadas de forma cronologica
        /// </summary>
        public List<Notification> Notifications { get; set; } = new List<Notification>();

        public NotificationPreference NotificationPreference { get; set; } = NotificationPreference.AllowEverything;
    }
}