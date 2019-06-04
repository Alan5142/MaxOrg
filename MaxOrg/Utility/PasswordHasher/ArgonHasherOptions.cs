using Sodium;

namespace MaxOrg.Utility.PasswordHasher
{
    public class ArgonHasherOptions
    {
        public PasswordHash.StrengthArgon Strength { get; set; } = PasswordHash.StrengthArgon.Interactive;
    }
}