using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Octokit;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace MaxOrg.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IArangoDatabase m_database;
        public IConfiguration Configuration { get; }
        private PasswordHasher<Models.User> m_passwordHasher;
        private static HttpClient client = new HttpClient();

        public LoginController(IConfiguration configuration, IArangoDatabase database)
        {
            Configuration = configuration;
            m_passwordHasher = new PasswordHasher<Models.User>();
            m_database = database;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Post([FromBody] Login userLoginData)
        {
            if (userLoginData.password == null || userLoginData.username == null)
            {
                return BadRequest(new {message = "No password or username was given"});
            }

            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var user = await (from u in db.Query<Models.User>()
                    where u.Username == userLoginData.username
                    select u).FirstOrDefaultAsync();
                if (user != null)
                {
                    if (m_passwordHasher.VerifyHashedPassword(user, user.Password,
                            user.Salt + userLoginData.password) != PasswordVerificationResult.Success)
                    {
                        return BadRequest(new {message = "Username or password are incorrect"});
                    }

                    var token = await GenerateRefreshAndJwtToken(user);
                    var response = new LoginResponse
                    {
                        userId = user.Key,
                        userResourceLocation = "users/" + user.Key,
                        token = token.token,
                        refreshToken = token.refreshToken.Token
                    };
                    return Ok(response);
                }
                else
                {
                    return NotFound(new {message = "Incorrect username or password"});
                }
            }
        }

        [HttpPost("refreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest token)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var dateNow = DateTime.Now;
                var userTokenPair = await (from t in db.Query<RefreshToken>()
                    from u in db.Query<Models.User>()
                    where t.UserKey == u.Key
                    select new {token = t, user = u}).FirstOrDefaultAsync();

                var expirationDate = userTokenPair.token.Expires;
                // refresh token is not valid :(
                if (expirationDate <= dateNow)
                {
                    return BadRequest(new {message = "Token expired"});
                }

                // created token
                var newToken = GenerateJwtToken(userTokenPair.user);
                return Ok(new RefreshTokenResponse
                {
                    token = newToken,
                    userId = userTokenPair.user.Key,
                    message = $"Successfull created token"
                });
            }
        }

        [HttpPost("github")]
        public async Task<IActionResult> Github([FromBody] GitHubLogin loginParameters)
        {
            // get an access token
            var tokenResponse = await GetGitHubAccessToken(loginParameters.AccessToken);

            using (var db = ArangoDatabase.CreateWithSetting())
            {
                var hasPassword = true;
                Models.User userToAuth;

                // MaxOrg is using the API
                var githubClient = new GitHubClient(new Octokit.ProductHeaderValue("MaxOrg"));

                // github credentials
                Credentials tokenAuth;
                try
                {
                    tokenAuth = new Credentials(tokenResponse.AccessToken);
                }
                catch (Exception)
                {
                    return StatusCode(500);
                }

                githubClient.Credentials = tokenAuth;

                // get user email
                var githubUser = await githubClient.User.Current();

                var userWithSameId = await (from u in db.Query<Models.User>()
                    where u.GithubId == githubUser.Id
                    select u).FirstOrDefaultAsync();

                // the account is linked
                if (userWithSameId != null)
                {
                    userToAuth = userWithSameId;
                    hasPassword = userToAuth.Password != null;
                }
                else
                {
                    // we can't register accounts without public email :(
                    // but we can link those accounts with existing accounts :)
                    if (githubUser.Email == null)
                    {
                        return BadRequest(new {message = "GitHub user doesn't have a published email"});
                    }

                    var userWithSameEmail = await (from u in db.Query<Models.User>()
                        where u.Email == githubUser.Email
                        select u).FirstOrDefaultAsync();
                    if (userWithSameEmail != null)
                    {
                        // Email is already registered

                        // first github login
                        if (userWithSameEmail.GithubId == null)
                        {
                            // well, user needs to link his account from account settings
                            return
                                BadRequest(new
                                    {message = "Email already exists, link your account from 'Account settings'"});
                        }

                        userToAuth = userWithSameEmail;
                        hasPassword = false;
                    }
                    else
                    {
                        userToAuth = new Models.User
                        {
                            Description = githubUser.Bio,
                            RealName = githubUser.Name,
                            Email = githubUser.Email,
                            GithubToken = tokenResponse.AccessToken,
                            GithubId = githubUser.Id
                        };

                        var usernameExists = await (from u in db.Query<Models.User>()
                            where u.Username == githubUser.Login
                            select u).FirstOrDefaultAsync();
                        string username = githubUser.Login;

                        // concat a random number to username if the username exists
                        if (usernameExists != null)
                        {
                            username = githubUser.Location + new Random(DateTime.Now.Millisecond).Next(100, 10000);
                        }

                        userToAuth.Username = username;

                        // insert the user
                        var insertedUser = await db.InsertAsync<Models.User>(userToAuth);
                        userToAuth.Key = insertedUser.Key;
                        hasPassword = false;
                    }
                }

                // generate a token :D
                var token = await GenerateRefreshAndJwtToken(userToAuth);
                var response = new LoginResponse
                {
                    userId = userToAuth.Key,
                    userResourceLocation = "users/" + userToAuth.Key,
                    token = token.token,
                    refreshToken = token.refreshToken.Token
                };
                if (hasPassword)
                {
                    HttpContext.Response.Headers.Add("HasPassword", "true");
                }

                return Ok(response);
            }
        }

        /// <summary>
        /// Obtiene un token de acceso a GitHub
        /// </summary>
        /// <param name="code">Código que servirá para generar el token (vease la documentación de GitHub respecto a OAuth)</param>
        /// <returns>Un response con el token de acceso, el tipo y el alcance</returns>
        private async Task<GitHubTokenResponse> GetGitHubAccessToken(string code)
        {
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var httpResult = await client.PostAsJsonAsync("https://github.com/login/oauth/access_token",
                new
                {
                    client_id = Configuration["AppSettings:GitHub:ClientID"],
                    client_secret = Configuration["AppSettings:GitHub:ClientSecret"],
                    code
                });
            var data = await httpResult.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<GitHubTokenResponse>(data);
        }

        /// <summary>
        /// Implementación para generar un token JWT
        /// </summary>
        /// <param name="user">Usuario para el que se generará el token</param>
        /// <returns>Token como cadena de texto</returns>
        private string GenerateJwtToken(Models.User user)
        {
            var key = Encoding.ASCII.GetBytes(Configuration["AppSettings:Secret"]);
            var tokenHandler = new JwtSecurityTokenHandler();

            var nowDate = DateTime.Now;

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Key.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Surname, user.Username)
                }),
                NotBefore = nowDate,
                Expires = nowDate.AddDays(1),
                Issuer = Configuration["AppSettings:DefaultURL"],
                Audience = Configuration["AppSettings:Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// Genera un token JWT y un token para refrescar el token
        /// </summary>
        /// <param name="user">usuario que se desea autenticar</param>
        /// <returns>
        /// La tarea que ejecutará el código, esta tarea contiene como valores una tupla
        /// con 2 variables: 
        ///     token: token JWT que se utilizará para todas las tareas que requieran autenticación, este token expira despues de unas horas
        ///     refreshToken token que servirá para refrescar el token dado, este token expira despues de 1 día
        /// </returns>
        private async Task<(string token, RefreshToken refreshToken)> GenerateRefreshAndJwtToken(Models.User user)
        {
            var nowDate = DateTime.Now;
            var token = GenerateJwtToken(user);
            var refreshToken = new RefreshToken
            {
                Token = Guid.NewGuid().ToString("N"),
                IssuedAt = nowDate,
                Expires = nowDate.AddDays(7),
                UserKey = user.Key
            };

            await WriteRefreshTokenToDb(refreshToken);

            return (token, refreshToken);
        }

        /// <summary>
        /// Genera un token de refresco que servirá para pedir un token de acceso, los token de refresco tienen una vida util mayor
        /// </summary>
        /// <returns>Token generado</returns>
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        /// <summary>
        /// Escribe el token en la base de datos
        /// </summary>
        /// <param name="token">token a escribir en la BD</param>
        /// <returns>La tarea que ejecutará el código, esta tarea no regresa variables</returns>
        private async Task WriteRefreshTokenToDb(RefreshToken token)
        {
            using (var db = ArangoDatabase.CreateWithSetting())
            {
                await db.InsertAsync<RefreshToken>(token);
            }
        }
    }
}