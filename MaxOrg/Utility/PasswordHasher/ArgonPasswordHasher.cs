using System;
using MaxOrg.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Sodium;

namespace MaxOrg.Utility.PasswordHasher
{
    public class ArgonPasswordHasher<TUser> : IPasswordHasher<TUser> where TUser : User
    {
        private ArgonHasherOptions HasherOptions { get; }
        private PasswordHasher<TUser> PreviousHasher { get; }

        public ArgonPasswordHasher(IOptions<ArgonHasherOptions> optionsAccessor = null)
        {
            PreviousHasher = new PasswordHasher<TUser>();
            HasherOptions = optionsAccessor?.Value ?? new ArgonHasherOptions();
        }
        
        public string HashPassword(TUser user, string password)
        {
            if (password == null) throw new ArgumentNullException(nameof(password));
            return PasswordHash.ArgonHashString(password, HasherOptions.Strength);
        }

        public PasswordVerificationResult VerifyHashedPassword(TUser user, string hashedPassword, string providedPassword)
        {
            if (hashedPassword == null) throw new ArgumentNullException(nameof(hashedPassword));
            if (providedPassword == null) throw new ArgumentNullException(nameof(providedPassword));
            try
            {
                var previousHash = PreviousHasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
                if (previousHash == PasswordVerificationResult.Success)
                {
                    user.Password = PasswordHash.ArgonHashString(providedPassword, HasherOptions.Strength);
                    return PasswordVerificationResult.SuccessRehashNeeded;
                }
            }
            catch (FormatException)
            {
            }
            
            var currentHashSuccess = PasswordHash.ArgonHashStringVerify(hashedPassword, providedPassword);
            return currentHashSuccess ? PasswordVerificationResult.Success : PasswordVerificationResult.Failed;
        }
    }
}