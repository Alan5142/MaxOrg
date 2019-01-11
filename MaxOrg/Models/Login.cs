using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    public class Login
    {
        public string username { get; set; }
        public string password { get; set; }
    }

    public class LoginResponse
    {
        public string userId;
        public string userResourceLocation;
        public string token;
        public string refreshToken;
    }

    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class RefreshToken
    {
        public string Key;
        public string Token;
        public DateTime IssuedAt;
        public DateTime Expires;
        public string UserKey;
    }

    public class RefreshTokenRequest
    {
        public string refreshToken;
    }

    public class RefreshTokenResponse
    {
        public string userId;
        public string token;
        public string message;
    }

}
