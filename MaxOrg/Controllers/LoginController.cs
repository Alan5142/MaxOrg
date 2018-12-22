using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MaxOrg.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        public IConfiguration Configuration { get; }
        private PasswordHasher<User> m_passwordHasher;
        private static HttpClient client = new HttpClient();

        public LoginController(IConfiguration configuration)
        {
            Configuration = configuration;
            m_passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost]
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

        [HttpPost("github")]
        public async Task<IActionResult> Github([FromBody] GitHubLogin loginParameters)
        {
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string clientId = Configuration["AppSettings:GitHub:ClientID"];
            string clientSecret = Configuration["AppSettings:GitHub:ClientSecret"];
            string code = Configuration["AppSettings:GitHub:ClientID"];

            var httpResult = await client.PostAsJsonAsync("https://github.com/login/oauth/access_token", new
            {
                client_id = Configuration["AppSettings:GitHub:ClientID"],
                client_secret = Configuration["AppSettings:GitHub:ClientSecret"],
                code = loginParameters.AccessToken
            });
            var content = await httpResult.Content.ReadAsStringAsync();
            var token = JsonConvert.DeserializeObject<GitHubTokenResponse>(content);
            return Ok();
        }
    }
}
