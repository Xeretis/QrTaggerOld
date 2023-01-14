using System.Security.Claims;
using AutoMapper;
using backend.Data;
using backend.Models.Responses;
using backend.Services;
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

    [HttpGet("{token}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<IndexChatMessagesResponse>>> IndexMessages(string token)
    {
        var itemTag = await _dbContext.ItemTags.AsNoTracking().FirstOrDefaultAsync(t => t.Token == token);

        if (itemTag == null)
            return NotFound();

        var messages = await _dbContext.ChatMessages
            .Where(m => m.TagId == itemTag.Id && (m.ToId == User.GetMainId() || m.FromId == User.GetMainId()))
            .OrderBy(m => m.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        var messagesDict = messages.GroupBy(m => m.FromId == User.GetMainId() ? m.ToId : m.FromId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var res = messagesDict.Select(m => new IndexChatMessagesResponse
        {
            UserId = m.Key,
            Messages = m.Value.Select(message => new IndexChatMessagesResponseMessage
            {
                Message = message.Message,
                CreatedAt = message.CreatedAt,
                Owned = message.FromId == User.GetMainId()
            })
        }).ToList();

        return Ok(res);
    }

    [AllowAnonymous]
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