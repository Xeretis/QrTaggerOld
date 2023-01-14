using System.Security.Claims;
using AutoMapper;
using backend.Data;
using backend.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<IEnumerable<ItemTagsIndexResponse>>> Index()
    {
        var itemTags = await _dbContext.ItemTags.Where(t => t.OwnerId == User.FindFirstValue(ClaimTypes.NameIdentifier))
            .AsNoTracking().ToListAsync();
        return Ok(_mapper.Map<IEnumerable<ItemTagsIndexResponse>>(itemTags));
    }
}