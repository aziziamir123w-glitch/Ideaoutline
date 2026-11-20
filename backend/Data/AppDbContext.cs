using DiscVault.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DiscVault.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasData(
            new AppUser { Id = 1, Username = "admin", Password = "123", Role = UserRole.Admin },
            new AppUser { Id = 2, Username = "seller1", Password = "123", Role = UserRole.Seller },
            new AppUser { Id = 3, Username = "buyer1", Password = "123", Role = UserRole.Buyer }
        );

        modelBuilder.Entity<Game>().HasData(
            new Game { Id = 1, Title = "Grand Theft Auto VI", Platform = "PS5", Genre = "Action", Price = 69.99m, Stock = 25, IsTopSeller = true, SellerName = "RockstarDirect" },
            new Game { Id = 2, Title = "Grand Theft Auto VI", Platform = "Xbox Series X", Genre = "Action", Price = 69.99m, Stock = 18, IsTopSeller = true, SellerName = "RockstarDirect" },
            new Game { Id = 3, Title = "Red Dead Redemption 2", Platform = "PS5", Genre = "Action", Price = 39.99m, Stock = 14, IsTopSeller = true, SellerName = "seller1" },
            new Game { Id = 4, Title = "EA Sports FC 26", Platform = "PS5", Genre = "Sports", Price = 59.99m, Stock = 30, IsTopSeller = true, SellerName = "seller1" },
            new Game { Id = 5, Title = "Marvel's Spider-Man 2", Platform = "PS5", Genre = "Action", Price = 49.99m, Stock = 11, IsTopSeller = false, SellerName = "seller1" },
            new Game { Id = 6, Title = "God of War Ragnarök", Platform = "PS5", Genre = "Action RPG", Price = 44.99m, Stock = 9, IsTopSeller = false, SellerName = "seller1" },
            new Game { Id = 7, Title = "Cyberpunk 2077: Ultimate Edition", Platform = "Xbox Series X", Genre = "RPG", Price = 49.99m, Stock = 13, IsTopSeller = false, SellerName = "seller1" },
            new Game { Id = 8, Title = "Elden Ring: Shadow of the Erdtree Edition", Platform = "PS5", Genre = "RPG", Price = 59.99m, Stock = 10, IsTopSeller = false, SellerName = "seller1" },
            new Game { Id = 9, Title = "The Legend of Zelda: Tears of the Kingdom", Platform = "Switch", Genre = "Adventure", Price = 59.99m, Stock = 12, IsTopSeller = false, SellerName = "seller1" },
            new Game { Id = 10, Title = "Mario Kart 8 Deluxe", Platform = "Switch", Genre = "Racing", Price = 49.99m, Stock = 20, IsTopSeller = false, SellerName = "seller1" }
        );
    }
}