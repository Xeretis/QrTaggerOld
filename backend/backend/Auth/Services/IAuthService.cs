using System.Security.Claims;
using backend.Data.Entities;

namespace backend.Auth.Services;

public interface IAuthService
{
    Task<List<Claim>> GetAuthClaims(ApiUser user);
}