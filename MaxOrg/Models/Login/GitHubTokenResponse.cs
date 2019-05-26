using Newtonsoft.Json;

namespace MaxOrg.Models.Login
{
    /// <summary>
    /// Representa la respuesta de los servidores de GitHub y sirve para poder hacer peticiones a la API de GitHub
    /// </summary>
    public class GitHubTokenResponse
    {
        /// <summary>
        /// Token de acceso que proporciona GitHub para poder hacer peticiones a sus servidores
        /// </summary>
        [JsonProperty("access_token")] public string AccessToken { get; set; }
        /// <summary>
        /// Tipo de token de acceso que proporciona GitHub
        /// </summary>
        public string Scope { get; set; }
        [JsonProperty("token_type")] public string TokenType { get; set; }
    }
}