using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
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
        /// Get a list of users, optionally filtered by name and sorted
        /// </summary>
        /// <returns>Ok if </returns>
        [HttpGet]
        public IActionResult Get([FromQuery] UsersQueryOptions options)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = from u in db.Query<User>()
                            select new
                            {
                                u.key,
                                u.username,
                                u.email,
                                u.description,
                                u.occupation,
                                birthday = AQL.DateFormat(u.birthday, "%dd/%mm/%yyyy")
                            };
                if (options.name != null)
                {
                    query = query.Where(u => AQL.Contains(AQL.Lower(u.username), AQL.Lower(options.name)));
                }
                if (options.email != null)
                {
                    query = from u in query
                            where AQL.Lower(u.email) == AQL.Lower(options.email)
                            select u;
                }
                if (options.limit.HasValue)
                {
                    query = query.Take(options.limit.Value);
                }
                if (options.sorted.HasValue && options.sorted.Value == true)
                {
                    query.OrderBy(user => user.username);
                }
                if (query.Count() >= 250 || options.page.HasValue)
                {
                    int skipValue = (options.page.HasValue ? options.page.Value : 0) * 250;
                    query = query.Skip(skipValue).Take(250).Select(u => u);
                }
                if(options.maxElements.HasValue && options.maxElements.Value > 0)
                {
                    query = query.Take(options.maxElements.Value);
                }
                return Ok(query);
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> PostAsync([FromBody] UserForm user)
        {
            if (string.IsNullOrEmpty(user.username) || string.IsNullOrEmpty(user.password) ||
                        string.IsNullOrEmpty(user.email))
            {
                return BadRequest(new { message = "username, password or email are empty" });
            }
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = from u in db.Query<User>()
                            where u.username == user.username
                            select u;

                if (query.Count() > 0)
                {
                    return Conflict(new { message = $"Username {user.username} already exists" });
                }
                query = db.Query<User>().Where(u => u.email == user.email);
                if (query.Count() > 0)
                {
                    return Conflict(new { message = $"Email {user.email} already exists" });
                }
                var userToInsert = new User(user);
                userToInsert.password = m_passwordHasher.HashPassword(userToInsert, user.password);

                var createdUser = await db.InsertAsync<User>(userToInsert);
                return Created("api/users/" + createdUser.Key, new
                {
                    message = "Please, go to 'api/login' to obtain a token",
                    user.username,
                    user.email
                });
            }
        }


        [HttpGet("{userId}")]
        public async Task<ActionResult> Get(string userId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<User>()
                             where u.key == userId
                             select new { u.username, u.realName, u.email, u.description, u.birthday, u.occupation })
                             .FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
        }

        [Authorize]
        [HttpGet("projects")]
        public ActionResult Projects()
        {
            var claim = HttpContext.User.Claims.FirstOrDefault();
            return Ok(new { projects = new string[] { "hello", "world" }, claim = claim.Value });
        }
    }
}