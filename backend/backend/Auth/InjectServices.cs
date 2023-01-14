using backend.Auth.Services;
using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Identity;

namespace backend.Auth;

public static class InjectServices
{
    public static IServiceCollection AddAuth(this IServiceCollection services)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o =>
        {
            o.Events.OnRedirectToLogin = (context) =>
            {
                context.Response.StatusCode = 401;
                return Task.CompletedTask;
            };
        });

        var core = services.AddIdentityCore<ApiUser>(options =>
        {
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedAccount = false;
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
        });

        var builder = new IdentityBuilder(core.UserType, typeof(IdentityRole), services);
        builder.AddEntityFrameworkStores<ApplicationDbContext>().AddRoles<IdentityRole>()
            .AddSignInManager<SignInManager<ApiUser>>()
            .AddDefaultTokenProviders();

        services.AddScoped<IAuthService, AuthService>();

        services.AddTransient<IPolicyEvaluator, ChallengeUnauthenticatedPolicyEvaluator>();
        services.AddTransient<PolicyEvaluator>();

        return services;
    }
}