using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MaxOrg.Controllers
{
    public class User
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string key { get; set; }
        public string username { get; set; }
        public string password { get; set; }
    }

    [Route("api/[Controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        public LoginController()
        {
        }

        public ActionResult<JsonResult> Post([FromBody] User user)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = (from u in db.Query<User>() where u.username == user.username && u.password == user.password
                            select new User { username = u.username, key = u.key }).ToList();

                if (query.Count() == 1)
                {
                    var u = query.ElementAt(0);
                    JsonResult jsonResult = new JsonResult(u);
                    return Ok("Exito");
                }
                else
                {
                    return NotFound("Usuario");
                }
            }
        }
    }
}