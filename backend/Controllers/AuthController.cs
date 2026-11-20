using DiscVault.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscVault.Api.Controllers;

public record LoginRequest(string Username, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuthController(AppDbContext db) => _db = db;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user is null)
            return Unauthorized("Invalid username or password.");

        return Ok(new
        {
            user.Id,
            user.Username,
            Role = user.Role.ToString()
        });
    }
}