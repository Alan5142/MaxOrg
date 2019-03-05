using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    public class GitHubLogin
    {
        [Required] public string AccessToken { get; set; }
    }

    public class GitHubTokenResponse
    {
        [JsonProperty("access_token")] public string AccessToken { get; set; }
        public string Scope { get; set; }
        [JsonProperty("token_type")] public string TokenType { get; set; }
    }
}