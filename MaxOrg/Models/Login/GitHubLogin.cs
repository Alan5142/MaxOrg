using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Login
{
    /// <summary>
    /// Representa los datos de autenticación que se utilizarán para solicitar un token de acceso a los servidores de
    /// GitHub
    /// </summary>
    public class GitHubLogin
    {
        /// <summary>
        /// Token de acceso retornado por GitHub al momento de iniciar sesión en MaxOrg a través de GitHub
        /// </summary>
        [Required] public string AccessToken { get; set; }
    }
}