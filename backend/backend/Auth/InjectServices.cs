using backend.Auth.Services;
using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Identity;

namespace backend.Auth;

public static class InjectServices
{
    public static IServiceCollection AddAuth(this IServiceCollection services)
    {
        services.AddAuthentication(o => { o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme; })
            .AddCookie(
                CookieAuthenticationDefaults.AuthenticationScheme, o =>
                {
                    o.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = 401;
                        return Task.CompletedTask;
                    };
                })
            .AddCookie("LocationAuth", o =>
            {
                o.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization(o =>
        {
            var defaultAuthorizationPolicyBuilder =
                new AuthorizationPolicyBuilder(CookieAuthenticationDefaults.AuthenticationScheme);
            defaultAuthorizationPolicyBuilder =
                defaultAuthorizationPolicyBuilder.RequireAuthenticatedUser();
            o.DefaultPolicy = defaultAuthorizationPolicyBuilder.Build();

            var onlyLocationAuth = new AuthorizationPolicyBuilder("LocationAuth");
            o.AddPolicy("LocationAuth", onlyLocationAuth
                .RequireAuthenticatedUser()
                .Build());
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