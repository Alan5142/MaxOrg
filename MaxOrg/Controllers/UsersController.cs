using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace MaxOrg.Controllers
{
    public class UsersQueryOptions
    {
        public string name { get; set; }
        public bool? sorted { get; set; }
        public int? limit { get; set; }
        public int? page { get; set; }
        public string email { get; set; }
        public int? maxElements { get; set; }
    }

    public class NotificationQueryOptions
    {
        public int? Limit { get; set; }
        public int? Page { get; set; }
    }
    
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private PasswordHasher<User> m_passwordHasher;

        public UsersController()
        {
            m_passwordHasher = new PasswordHasher<User>();
        }

        /// <summary>
        /// Obtiene una lista de todos los usuarios
        /// </summary>
        /// <remarks>
        /// Se puede filtrar por nombres que contengan ciertas letras, pedir los nombres de manera ordenada,
        /// pedir un limite, paginar con base en un limite, por email y 
        /// </remarks>
        /// <returns>Ok if </returns>
        [HttpGet]
        public IActionResult GetAllUsers([FromQuery] UsersQueryOptions options)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = from u in db.Query<User>()
                    select new
                    {
                        u.Key,
                        u.Username,
                        u.RealName,
                        u.Email,
                        u.Description,
                        u.Occupation,
                        birthday = AQL.DateFormat(u.Birthday, "%dd/%mm/%yyyy")
                    };
                if (options.name != null)
                {
                    query = query.Where(u => AQL.Contains(AQL.Lower(u.Username), AQL.Lower(options.name)));
                }

                if (options.email != null)
                {
                    query = from u in query
                        where AQL.Lower(u.Email) == AQL.Lower(options.email)
                        select u;
                }

                if (options.limit.HasValue)
                {
                    query = query.Take(options.limit.Value);
                }

                if (options.sorted.HasValue && options.sorted.Value == true)
                {
                    query = query.OrderBy(user => user.Username);
                }

                var defaultValue = query.FirstOrDefault();
                var queryCount = query.Count();
                if (query.Count() >= 250 || options.page.HasValue)
                {
                    var skipValue = (options.page ?? 0) * 250;
                    query = query.Skip(skipValue).Take(250).Select(u => u);
                }

                if (options.maxElements.HasValue && options.maxElements.Value > 0)
                {
                    query = query.Take(options.maxElements.Value);
                }

                return Ok(query);
            }
        }

        /// <summary>
        /// Crea un nuevo usuario
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> PostAsync([FromBody] UserForm user)
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password) ||
                string.IsNullOrEmpty(user.Email))
            {
                return BadRequest(new {message = "username, password or email are empty"});
            }

            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = from u in db.Query<User>()
                    where u.Username == user.Username
                    select u;

                if (query.Any())
                {
                    return Conflict(new {message = $"Username {user.Username} already exists"});
                }

                query = db.Query<User>().Where(u => u.Email == user.Email);
                if (query.Any())
                {
                    return Conflict(new {message = $"Email {user.Email} already exists"});
                }

                var random = new RNGCryptoServiceProvider();
                var salt = new byte[32];
                random.GetBytes(salt);
                var saltAsString = Convert.ToBase64String(salt);

                var userToInsert = new User(user);
                userToInsert.Password = m_passwordHasher.HashPassword(userToInsert, saltAsString + user.Password);
                userToInsert.Salt = saltAsString;

                var createdUser = await db.InsertAsync<User>(userToInsert);
                return Created("api/users/" + createdUser.Key, new
                {
                    message = "Please, go to 'api/login' to obtain a token",
                    user.Username,
                    user.Email
                });
            }
        }


        [HttpGet("{userId}")]
        public async Task<ActionResult> GetUserInfo(string userId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<User>()
                        where u.Key == userId
                        select new {u.Username, u.RealName, u.Email, u.Description, u.Birthday, u.Occupation, u.Key})
                    .FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(user);
            }
        }

        [Authorize]
        [HttpPatch("{userId}")]
        public async Task<ActionResult> ChangeUserInformation(string userId, [FromBody] UserUpdateInfo userData)
        {
            if (userId != HttpContext.User.Claims.FirstOrDefault()?.Value)
            {
                return Unauthorized();
            }

            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<User>()
                    where u.Key == userId
                    select u).FirstOrDefaultAsync();

                // no user exists
                if (user == null)
                {
                    return NotFound();
                }

                user.Password = userData.password != null
                    ? m_passwordHasher.HashPassword(user, userData.password)
                    : user.Password;
                user.Username = userData.username ?? user.Username;
                user.Email = userData.email ?? userData.email;
                user.RealName = userData.realName ?? user.RealName;
                user.Description = userData.description ?? user.Description;
                user.Birthday = userData.birthday ?? user.Birthday;

                await db.UpdateByIdAsync<User>(userId, user);

                return Ok();
            }
        }

        #region Notifications
        
        [Authorize]
        [HttpGet("notifications")]
        public async Task<IActionResult> GetUserNotifications([FromQuery] NotificationQueryOptions queryOptions)
        {
            var user = await GetUserWithId(HttpContext.User.Identity.Name);
            if (user == null)
            {
                return NotFound();
            }

            IEnumerable<Notification> notifications = user.Notifications;

            if (queryOptions?.Limit != null)
            {
                notifications = notifications
                    .Skip((queryOptions.Page - 1) * queryOptions.Limit.Value ?? 0 + queryOptions.Limit.Value)
                    .Take(queryOptions.Limit.Value);
            }

            notifications = notifications.OrderByDescending(not => not.TriggerDate);

            return Ok(notifications);
        }

        [Authorize]
        [HttpGet("notifications/preferences")]
        public async Task<IActionResult> GetUserNotificationPreferences()
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<User>()
                    where u.Key == HttpContext.User.Identity.Name
                    select u).FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound();
                }
                
                return Ok(new{Preferences = user.NotificationPreference});
            }
        }
        
        [Authorize]
        [HttpPut("notifications/{notificationId}/mark-as-read")]
        public async Task<IActionResult> MarkNotificationAsRead(string notificationId)
        {
            var user = await GetUserWithId(HttpContext.User.Identity.Name);
            if (user == null)
            {
                return NotFound();
            }

            var notification =  user.Notifications.Find(n => n.Id == notificationId);
            if (notification == null)
            {
                return NotFound();
            }

            notification.Read = true;

            await UpdateUser(user);
            return Ok();
        }
        #endregion

        #region Common

        private async Task<User> GetUserWithId(string userId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var selectedUser = await (from u in db.Query<Models.User>()
                    where u.Key == userId
                    select u).FirstOrDefaultAsync();
                return selectedUser;
            }
        }

        private async Task UpdateUser(User userToUpdate)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                await db.UpdateByIdAsync<User>(userToUpdate.Id, userToUpdate);
            }
        }
        
        #endregion
    }
}
