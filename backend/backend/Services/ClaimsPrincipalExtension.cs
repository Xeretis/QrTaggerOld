using System.Security.Claims;

namespace backend.Services;

public static class ClaimsPrincipalExtension
{
    public static string? GetMainId(this ClaimsPrincipal principal)
    {
        var mainIdentity = principal.Identities
            .FirstOrDefault(i => i.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name) != null);

        var userId = mainIdentity != null
            ? mainIdentity.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.NameIdentifier)!.Value
            : principal.FindFirstValue(ClaimTypes.NameIdentifier);

        return userId;
    }
}