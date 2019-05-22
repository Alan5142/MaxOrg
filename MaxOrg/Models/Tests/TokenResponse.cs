using System;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace MaxOrg.Models.Tests
{
    public class TokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("token_type")]
        public string TokenType { get; set; }

        [JsonProperty("refresh_token")]
        public string RefreshToken { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }

        public bool IsPending { get; set; }
    }
}