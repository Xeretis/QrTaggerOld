using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Identity;

namespace backend.Auth;

public static class InjectServices
{
    public static IServiceCollection AddAuth(this IServiceCollection services)
    {
        services.AddAuthentication("cookie").AddCookie("cookie");

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

        //services.AddScoped<IAuthService, AuthService>();

        services.AddTransient<IPolicyEvaluator, ChallengeUnauthenticatedPolicyEvaluator>();
        services.AddTransient<PolicyEvaluator>();

        return services;
    }
}