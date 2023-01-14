using System.Security.Claims;
using AutoMapper;
using backend.Auth.Services;
using backend.Data;
using backend.Data.Entities;
using backend.Models.Requests;
using backend.Models.Responses;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace backend.Controllers;

[ApiController]
[Route("Api/[controller]")]
[Produces("application/json")]
public class AuthController : Controller
{
    private readonly IAuthService _authService;
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly SignInManager<ApiUser> _signInManager;
    private readonly UserManager<ApiUser> _userManager;

    public AuthController(IAuthService authService, IMapper mapper, SignInManager<ApiUser> signInManager,
        ApplicationDbContext dbContext, UserManager<ApiUser> userManager)
    {
        _authService = authService;
        _mapper = mapper;
        _signInManager = signInManager;
        _dbContext = dbContext;
        _userManager = userManager;
    }
    
    [HttpPost("Register")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = _mapper.Map<ApiUser>(request);

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                switch (error.Code)
                {
                    case "DuplicateUserName":
                        ModelState.AddModelError(nameof(request.UserName), error.Description);
                        break;
                    case "DuplicateEmail":
                        ModelState.AddModelError(nameof(request.Email), error.Description);
                        break;
                    case "PasswordTooShort":
                        ModelState.AddModelError(nameof(request.Password), error.Description);
                        break;
                    default:
                        ModelState.AddModelError(nameof(request.UserName), error.Description);
                        break;
                }
            }

            return ValidationProblem();
        }
        
        return NoContent();
    }
    
    [HttpPost("Login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            ModelState.AddModelError(nameof(LoginRequest.Email), "Email or password is invalid");
            return ValidationProblem();
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password,
            await _userManager.GetLockoutEnabledAsync(user));

        if (result == SignInResult.Failed)
        {
            ModelState.AddModelError(nameof(LoginRequest.Email), "Email or password is invalid");
            return ValidationProblem();
        }


        var authClaims = await _authService.GetAuthClaims(user);
        var identity = new ClaimsIdentity(authClaims, CookieAuthenticationDefaults.AuthenticationScheme);
        
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = true,
                AllowRefresh = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(2),
            });
        
        var userResponse = _mapper.Map<LoginResponseUser>(user);

        return Ok(new LoginResponse
        {
            User = userResponse
        });
    }
    
    [Authorize]
    [HttpGet("User")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponse>> GetUser()
    {
        var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(_mapper.Map<UserResponse>(user));
    }
    
    [Authorize]
    [HttpDelete("Logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
}