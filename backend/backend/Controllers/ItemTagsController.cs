using System.Security.Claims;
using System.Security.Cryptography;
using AutoMapper;
using backend.Data;
using backend.Data.Entities;
using backend.Models.Requests;
using backend.Models.Responses;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Net.Codecrete.QrCodeGenerator;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("Api/[controller]")]
[Produces("application/json")]
public class ItemTagsController : Controller
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public ItemTagsController(ApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<IndexItemTagsResponse>>> Index()
    {
        var itemTags = await _dbContext.ItemTags.Where(t => t.OwnerId == User.FindFirstValue(ClaimTypes.NameIdentifier))
            .AsNoTracking().ToListAsync();
        return Ok(_mapper.Map<IEnumerable<IndexItemTagsResponse>>(itemTags));
    }

    [AllowAnonymous]
    [HttpGet("{token}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public new async Task<ActionResult<ViewItemTagResponse>> View(string token)
    {
        var itemTag = await _dbContext.ItemTags.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Token == token);

        if (itemTag == null) return NotFound();

        var response = _mapper.Map<ViewItemTagResponse>(itemTag);

        if (itemTag.OwnerId == User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            response.Description = itemTag.Description;
            var qrCode = QrCode.EncodeText($"{Request.GetBaseUrl()}tags/view/{token}",
                QrCode.Ecc.Medium);
            var svgText = qrCode.ToSvgString(1);
            response.QRCode = svgText.Substring(svgText.IndexOf("<svg", StringComparison.Ordinal));
        }

        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateItemTagResponse>> Create(CreateItemTagRequest request)
    {
        var itemTag = _mapper.Map<ItemTag>(request);
        itemTag.OwnerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        itemTag.Token = Base64UrlEncoder.Encode(Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)));

        await _dbContext.ItemTags.AddAsync(itemTag);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(View), new { token = itemTag.Token },
            _mapper.Map<CreateItemTagResponse>(itemTag));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Update(int id, UpdateItemTagRequest request)
    {
        var itemTag = await _dbContext.ItemTags.Where(t => t.OwnerId == User.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(t => t.Id == id);

        if (itemTag == null) return NotFound();

        _mapper.Map(request, itemTag);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        var itemTag = _dbContext.ItemTags.Where(t => t.OwnerId == User.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefault(t => t.Id == id);

        if (itemTag == null) return NotFound();

        _dbContext.ItemTags.Remove(itemTag);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}