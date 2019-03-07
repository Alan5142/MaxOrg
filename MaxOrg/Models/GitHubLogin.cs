﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
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