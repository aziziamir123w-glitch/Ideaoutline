namespace DiscVault.Api.Models;

public enum UserRole
{
    Buyer,
    Seller,
    Admin
}

public class AppUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Prototype only; hash in production
    public UserRole Role { get; set; } = UserRole.Buyer;
}

public class Game
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty; // PS5, Xbox Series X, Switch, PC
    public string Genre { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsTopSeller { get; set; }
    public string SellerName { get; set; } = "DiscVault Official";
}

public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int GameId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}