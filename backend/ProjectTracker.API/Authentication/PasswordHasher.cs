using BC = BCrypt.Net.BCrypt;

namespace ProjectTracker.API.Authentication;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BC.HashPassword(password, BC.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BC.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }
}
