using ArangoDB.Client;
using MaxOrg.Models;
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
    }

    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
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
                                             u.birthday
                                         };
                if (options.name != null)
                {
                    query = query.Where(u => AQL.Contains(u.username, options.name));
                }
                if (options.limit.HasValue)
                {
                    query = query.Take(options.limit.Value);
                }
                if (options.sorted.HasValue && options.sorted.Value == true)
                {
                    query.OrderBy(user => user.username);
                }

                return Ok(query);
            }
        }

        [HttpPost]
        public ActionResult Post([FromBody] User user)
        {
            if (string.IsNullOrEmpty(user.username) || string.IsNullOrEmpty(user.password) ||
                        string.IsNullOrEmpty(user.email))
            {
                return BadRequest(new { reason = "username, password or email are empty" });
            }
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = (from u in db.Query<User>()
                             where u.username == user.username
                             select new { u.username, u.key }).ToList();

                if (query.Count() == 1)
                {
                    return Conflict(new { reason = "Username already exists" });
                }
                var createdUser = db.Insert<User>(user);
                return Created("api/user/" + createdUser.Key, new { user.username, user.email });
            }
        }

        [HttpGet("{userId}")]
        public ActionResult Get(int userId)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = (from u in db.Query<User>()
                             where u.key == userId.ToString()
                             select new { u.username, u.email, u.description, u.birthday, u.occupation });
                if (query.Count() != 1)
                {
                    return NotFound();
                }
                return Ok(query.First());
            }
        }

        [HttpGet("{username}")]
        public ActionResult Get(string username)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var getUser = from u in db.Query<User>()
                              where u.username == username
                              select new { u.username, u.email, u.description, u.birthday, u.occupation };
                if (getUser.Count() != 1)
                {
                    return NotFound();
                }
                return Ok(getUser.First());
            }
        }
    }
}