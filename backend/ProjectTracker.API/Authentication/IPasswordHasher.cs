// Authentication/IPasswordHasher.cs
namespace ProjectTracker.API.Authentication;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}
