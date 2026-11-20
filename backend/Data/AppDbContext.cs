using DiscVault.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DiscVault.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Game> Games => Set<Game>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Game>().HasData(
            new Game { Id = 1, Title = "Grand Theft Auto VI", Platform = "PS5", Genre = "Action", Price = 69.99m, Stock = 25, IsTopSeller = true },
            new Game { Id = 2, Title = "Grand Theft Auto VI", Platform = "Xbox Series X", Genre = "Action", Price = 69.99m, Stock = 15, IsTopSeller = true },
            new Game { Id = 3, Title = "EA Sports FC 26", Platform = "PS5", Genre = "Sports", Price = 59.99m, Stock = 30, IsTopSeller = true },
            new Game { Id = 4, Title = "Elden Ring: Shadow of the Erdtree Edition", Platform = "PS5", Genre = "RPG", Price = 59.99m, Stock = 10, IsTopSeller = false },
            new Game { Id = 5, Title = "The Legend of Zelda: Tears of the Kingdom", Platform = "Switch", Genre = "Adventure", Price = 59.99m, Stock = 12, IsTopSeller = false }
        );
    }
}
