using DiscVault.Api.Data;
using DiscVault.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscVault.Api.Controllers;

public record CreateGameRequest(
    string Title,
    string Platform,
    string Genre,
    decimal Price,
    int Stock,
    bool IsTopSeller
);

public record RestockRequest(int AddStock);

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _db;
    public GamesController(AppDbContext db) => _db = db;

    private string CurrentRole =>
        Request.Headers["X-User-Role"].FirstOrDefault() ?? "Buyer";

    private string CurrentUser =>
        Request.Headers["X-User-Name"].FirstOrDefault() ?? "guest";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Game>>> GetGames(
        [FromQuery] string? platform,
        [FromQuery] string? search)
    {
        var query = _db.Games.AsQueryable();

        if (!string.IsNullOrWhiteSpace(platform))
            query = query.Where(g => g.Platform == platform);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(g => g.Title.ToLower().Contains(search.ToLower()));

        return Ok(await query.OrderBy(g => g.Id).ToListAsync());
    }

    // Allowed for Seller and Admin
    [HttpPost]
    public async Task<ActionResult<Game>> CreateGame(CreateGameRequest req)
    {
        if (CurrentRole is not ("Seller" or "Admin"))
            return Forbid();

        var game = new Game
        {
            Title = req.Title.Trim(),
            Platform = req.Platform,
            Genre = req.Genre.Trim(),
            Price = req.Price,
            Stock = req.Stock,
            IsTopSeller = req.IsTopSeller,
            SellerName = CurrentUser
        };

        _db.Games.Add(game);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetGames), new { id = game.Id }, game);
    }

    // Allowed for Seller and Admin
    [HttpPatch("{id}/restock")]
    public async Task<ActionResult<Game>> Restock(int id, RestockRequest req)
    {
        if (CurrentRole is not ("Seller" or "Admin"))
            return Forbid();

        var game = await _db.Games.FindAsync(id);
        if (game is null) return NotFound();

        game.Stock += Math.Max(1, req.AddStock);
        await _db.SaveChangesAsync();
        return Ok(game);
    }

    // Admin-only delete
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        if (CurrentRole != "Admin")
            return Forbid();

        var game = await _db.Games.FindAsync(id);
        if (game is null) return NotFound();

        _db.Games.Remove(game);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}