using System.Security.Claims;
using AutoMapper;
using backend.Data;
using backend.Models.Responses;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize("Both")]
[ApiController]
[Route("Api/[controller]")]
[Produces("application/json")]
public class ChatController : Controller
{
    private readonly ApplicationDbContext _dbContext;
    private IMapper _mapper;

    public ChatController(ApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    [HttpGet("{tagId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<IndexChatMessagesResponse>>> IndexMessages(int tagId)
    {
        var mainIdentity = User.Identities
            .FirstOrDefault(i => i.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name) != null);

        var userId = mainIdentity != null
            ? mainIdentity.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.NameIdentifier)!.Value
            : User.FindFirstValue(ClaimTypes.NameIdentifier);

        var messages = await _dbContext.ChatMessages.Where(m => m.TagId == tagId).OrderBy(m => m.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        var messagesDict = messages.GroupBy(m => m.FromId == userId ? m.ToId : m.FromId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var res = messagesDict.Select(m => new IndexChatMessagesResponse
        {
            UserId = m.Key,
            Messages = m.Value.Select(message => new IndexChatMessagesResponseMessage
            {
                Message = message.Message,
                CreatedAt = message.CreatedAt,
                Owned = message.FromId == userId
            })
        }).ToList();

        return Ok(res);
    }

    [HttpPost("Auth")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Auth()
    {
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        };

        var identity = new ClaimsIdentity(authClaims, "LocationAuth");

        if (User.Identity is { IsAuthenticated: true })
            User.AddIdentity(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            User.Identity is { IsAuthenticated: false } ? new ClaimsPrincipal(identity) : User,
            new AuthenticationProperties
            {
                IsPersistent = true,
                AllowRefresh = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddYears(1)
            });

        return NoContent();
    }
}