using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MaxOrg.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        public IConfiguration Configuration { get; }
        private PasswordHasher<User> m_passwordHasher;

        public LoginController(IConfiguration configuration)
        {
            Configuration = configuration;
            m_passwordHasher = new PasswordHasher<User>();
        }

        [AllowAnonymous]
        public async Task<ActionResult> Post([FromBody] Login userLoginData)
        {
            if (userLoginData.password == null || userLoginData.username == null)
            {
                return BadRequest(new { message = "No password or username was given" });
            }
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var query = from u in db.Query<User>()
                            where u.username == userLoginData.username
                            select u;

                if (query.Count() == 1)
                {
                    var user = await query.FirstAsync();
                    if (m_passwordHasher.VerifyHashedPassword(user, user.password, userLoginData.password) != PasswordVerificationResult.Success)
                    {
                        return BadRequest(new { message = "Username or password are incorrect" });
                    }
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.ASCII.GetBytes(Configuration["AppSettings:Secret"]);

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new Claim[]
                        {
                            new Claim(ClaimTypes.Name, user.key.ToString()),
                            new Claim(ClaimTypes.Email, user.email),
                            new Claim(ClaimTypes.Surname, user.username)
                        }),
                        Expires = DateTime.UtcNow.AddDays(1),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var response = new
                    {
                        userId = user.key,
                        userResourceLocation = "users/" + user.key,
                        token = tokenHandler.WriteToken(token)
                    };

                    return Ok(response);
                }
                else
                {
                    return NotFound(new { message = "Incorrect username or password" });
                }
            }
        }
    }
}
