namespace MaxOrg.Models.Login
{
    public class LoginResponse
    {
        public string UserId { get; set; }
        public string UserResourceLocation { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}