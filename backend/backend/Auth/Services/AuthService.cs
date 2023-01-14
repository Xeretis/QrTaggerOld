using System.Security.Claims;
using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace backend.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApiUser> _userManager;

    public AuthService(UserManager<ApiUser> userManager, IConfiguration configuration, ApplicationDbContext dbContext)
    {
        _userManager = userManager;
        _configuration = configuration;
        _dbContext = dbContext;
    }
    
    public async Task<List<Claim>> GetAuthClaims(ApiUser user)
    {
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.UserName),
            new(ClaimTypes.NameIdentifier, user.Id)
        };

        var userRoles = await _userManager.GetRolesAsync(user);

        authClaims.AddRange(userRoles.Select(userRole => new Claim(ClaimTypes.Role, userRole)));

        return authClaims;
    }
}