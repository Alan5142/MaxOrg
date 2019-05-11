using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models;
using MaxOrg.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage.Blob;

namespace MaxOrg.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private PasswordHasher<User> PasswordHasher { get; }
        private IConfiguration Configuration { get; }
        private CloudBlobContainer Container { get; }
        private IArangoDatabase Database { get; }
        
        public UsersController(IConfiguration configuration, CloudBlobContainer container, IArangoDatabase database)
        {
            Database = database;
            Container = container;
            Configuration = configuration;
            PasswordHasher = new PasswordHasher<User>();
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

        [Authorize]
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var db = Database;
            var user = await db.Query<User>()
                .Where(u => u.Key == HttpContext.User.Identity.Name)
                .Select(u => u)
                .FirstOrDefaultAsync();
                
            return Ok(new
            {
                user.Username,
                user.RealName,
                user.Email,
                user.Description,
                user.Birthday,
                user.Occupation,
                user.Key,
                user.NotificationPreference,
                ProfilePicture = $"{Configuration["AppSettings:DefaultURL"]}/api/users/{user.Key}/profile.jpeg"
            });
        }
        
        /// <summary>
        /// Crea un nuevo usuario
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> CreateUser([FromBody] UserForm user)
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password) ||
                string.IsNullOrEmpty(user.Email))
            {
                return BadRequest(new {message = "username, password or email are empty"});
            }

            var db = Database;
            var query = from u in db.Query<User>()
                where u.Username == user.Username
                select u;

            if (await query.FirstOrDefaultAsync() != null)
            {
                return Conflict(new {message = $"Username {user.Username} already exists"});
            }

            query = db.Query<User>().Where(u => u.Email == user.Email);
            if (await query.FirstOrDefaultAsync() != null)
            {
                return Conflict(new {message = $"Email {user.Email} already exists"});
            }

            var random = new RNGCryptoServiceProvider();
            var salt = new byte[32];
            random.GetBytes(salt);
            var saltAsString = Convert.ToBase64String(salt);

            var userToInsert = new User(user);
            userToInsert.Password = PasswordHasher.HashPassword(userToInsert, saltAsString + user.Password);
            userToInsert.Salt = saltAsString;

            var createdUser = await db.InsertAsync<User>(userToInsert);
            return Created("api/users/" + createdUser.Key, new
            {
                message = "Please, go to 'api/login' to obtain a token",
                user.Username,
                user.Email
            });
        }


        [HttpGet("{userId}")]
        public async Task<ActionResult> GetUserInfo(string userId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<User>()
                        where u.Key == userId
                        select new
                        {
                            u.Username, 
                            u.RealName,
                            u.Email,
                            u.Description,
                            u.Birthday,
                            u.Occupation,
                            u.Key
                        })
                    .FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    user.Username,
                    user.RealName,
                    user.Email,
                    user.Description,
                    user.Birthday,
                    user.Occupation,
                    user.Key,
                    ProfilePicture = $"{Configuration["AppSettings:DefaultURL"]}/api/users/{user.Key}/profile.jpeg"
                });
            }
        }

        [HttpGet("{userId}/profile.jpeg")]
        public async Task<IActionResult> GetUserProfilePicture(string userId)
        {
            var blob = Container.GetBlockBlobReference($"users/{userId}/profile.jpeg");
            if (!await blob.ExistsAsync())
            {
                return NotFound();
            }
            
            var sasConstraints = new SharedAccessBlobPolicy
            {
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddMinutes(10),
                Permissions = SharedAccessBlobPermissions.Read
            };

            var sasBlobToken = blob.GetSharedAccessSignature(sasConstraints);
            return Redirect(blob.Uri + sasBlobToken);
        }

        [Authorize]
        [HttpPut]
        public async Task<ActionResult> ChangeUserInformation([FromForm] UserUpdateInfo userData)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<User>()
                    where u.Key == HttpContext.User.Identity.Name
                    select u).FirstOrDefaultAsync();

                // no user exists
                if (user == null)
                {
                    return NotFound();
                }

                user.Password = userData.Password != null
                    ? PasswordHasher.HashPassword(user, userData.Password)
                    : user.Password;
                user.RealName = userData.RealName ?? user.RealName;
                user.Description = userData.Description ?? user.Description;
                user.Birthday = userData.Birthday ?? user.Birthday;
                user.Occupation = userData.Occupation ?? user.Occupation;
                user.NotificationPreference = userData.Preferences ?? user.NotificationPreference;
                if (userData.ProfilePicture != null || userData.ProfilePictureAsBase64 != null)
                {
                    var blob = Container.GetBlockBlobReference($"users/{user.Key}/profile.jpeg");
                    if (userData.ProfilePicture != null)
                    {
                        try
                        {
                            await blob.UploadFromStreamAsync(userData.ProfilePicture.OpenReadStream());
                        }
                        catch (Exception e)
                        {
                            Console.Error.WriteLine(e.Message);
                            return StatusCode(500);
                        }
                    }
                    else
                    {
                        try
                        {
                            var data = Convert.FromBase64String(userData.ProfilePictureAsBase64);
                            await blob.UploadFromByteArrayAsync(data, 0, data.Length);
                        }
                        catch (Exception e)
                        {
                            Console.Error.WriteLine(e);
                            return StatusCode(500);
                        }
                    }

                    await blob.FetchAttributesAsync();
                    blob.Properties.ContentType = "image/jpeg";
                    await blob.SetPropertiesAsync();
                }

                await db.UpdateByIdAsync<User>(user.Key, user);

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
        [HttpPost("notifications/preferences")]
        public async Task<IActionResult> SetUserNotificationPreferences([FromBody] NotificationPreference newPreference)
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

                user.NotificationPreference = newPreference;
                await db.UpdateByIdAsync<User>(user.Key, user);
                return Ok();
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
                var selectedUser = await (from u in db.Query<Models.Users.User>()
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
