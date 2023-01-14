using backend.Data;
using backend.Models.Requests;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("Api/[controller]")]
[Produces("application/json")]
public class LocationController : Controller
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMailService _mailService;

    public LocationController(IMailService mailService, ApplicationDbContext dbContext)
    {
        _mailService = mailService;
        _dbContext = dbContext;
    }

    [HttpPost("{token}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> ShareLocation(string token, ShareLocationRequest request)
    {
        var itemTag = await _dbContext.ItemTags.Include(t => t.Owner).FirstOrDefaultAsync(t => t.Token == token);

        if (itemTag == null) return NotFound();

        var mailData = new MailData
        {
            To = new List<string> { itemTag.Owner.Email },
            Subject = $"Item found: {itemTag.Name}",
            Body = @$"
                {itemTag.Name} appears to be found!

                It's location was reported at longitude: {request.Longitude}, latitude: {request.Latitude}
            "
        };

        var result = await _mailService.SendAsync(mailData, new CancellationToken());

        if (result) return NoContent();

        return StatusCode(StatusCodes.Status500InternalServerError,
            "An error occured. The Mail with attachment could not be sent.");
    }
}