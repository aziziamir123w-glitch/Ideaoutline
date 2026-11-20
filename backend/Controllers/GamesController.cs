using DiscVault.Api.Data;
using DiscVault.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscVault.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _db;
    public GamesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Game>>> GetGames(
        [FromQuery] string? platform,
        [FromQuery] string? search,
        [FromQuery] bool? topSellersOnly)
    {
        var query = _db.Games.AsQueryable();

        if (!string.IsNullOrWhiteSpace(platform))
            query = query.Where(g => g.Platform == platform);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(g => g.Title.ToLower().Contains(search.ToLower()));

        if (topSellersOnly == true)
            query = query.Where(g => g.IsTopSeller);

        return Ok(await query.ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<Game>> CreateGame(Game game)
    {
        _db.Games.Add(game);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetGames), new { id = game.Id }, game);
    }
}
