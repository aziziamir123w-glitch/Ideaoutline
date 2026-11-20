# Technical Specification: DiscVault (SPEC.md)

## 1. Database Schema (SQLite — `discvault.db`)

### Table: `Games`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique game identifier |
| `Title` | `TEXT` | `NOT NULL` | Game name (e.g., "Grand Theft Auto VI") |
| `Platform` | `TEXT` | `NOT NULL` | `"PS5"`, `"Xbox Series X"`, `"Switch"`, `"PC"` |
| `Genre` | `TEXT` | `NOT NULL` | e.g., `"Action"`, `"RPG"`, `"Sports"` |
| `Price` | `DECIMAL(10,2)` | `NOT NULL` | Unit price in USD (e.g., `69.99`) |
| `Stock` | `INTEGER` | `NOT NULL DEFAULT 0` | Available physical disc count |
| `IsTopSeller` | `BOOLEAN` | `NOT NULL DEFAULT 0` | `1` if featured in Top Sellers banner |
| `CoverImageUrl`| `TEXT` | `NULLABLE` | URL or local path to box art |

### Table: `Orders`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique order identifier |
| `CustomerName` | `TEXT` | `NOT NULL` | Buyer's full name |
| `OrderDate` | `DATETIME` | `NOT NULL` | UTC timestamp of purchase |
| `TotalAmount` | `DECIMAL(10,2)` | `NOT NULL` | Total order cost |

### Table: `OrderItems`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique line-item ID |
| `OrderId` | `INTEGER` | `FOREIGN KEY -> Orders(Id)` | Parent order |
| `GameId` | `INTEGER` | `FOREIGN KEY -> Games(Id)` | Purchased game disc |
| `Quantity` | `INTEGER` | `NOT NULL` | Number of discs bought |
| `UnitPrice` | `DECIMAL(10,2)` | `NOT NULL` | Price at time of purchase |

---

## 2. Backend API Contract (.NET Core Web API)
Base URL: `/api`

### Games Endpoints
* **`GET /api/games`**
  * **Query Params (Optional):** `?platform=PS5&search=GTA&topSellersOnly=true`
  * **Response (`200 OK`):** Array of Game JSON objects.
* **`GET /api/games/{id}`**
  * **Response (`200 OK`):** Single Game object | `404 Not Found`.
* **`POST /api/games`** *(Admin)*
  * **Request Body:** `{ "title": "GTA VI", "platform": "PS5", "genre": "Action", "price": 69.99, "stock": 50, "isTopSeller": true, "coverImageUrl": "..." }`
  * **Response (`201 Created`):** Created Game object.
* **`PUT /api/games/{id}`** *(Admin)*
  * **Request Body:** Updated Game fields (price, stock, isTopSeller, etc.).
  * **Response (`204 No Content`)** | `404 Not Found`.
* **`DELETE /api/games/{id}`** *(Admin)*
  * **Response (`204 No Content`)** | `404 Not Found`.

### Orders Endpoints
* **`POST /api/orders`** *(Checkout)*
  * **Request Body:**
    ```json
    {
      "customerName": "Amir Azizi",
      "items": [
        { "gameId": 1, "quantity": 1 }
      ]
    }
    ```
  * **Business Logic Spec:**
    1. Verify each `gameId` exists and `Game.Stock >= item.quantity`.
    2. If insufficient stock, return `400 Bad Request` with error message.
    3. Deduct `item.quantity` from `Game.Stock`.
    4. Calculate `TotalAmount`, save `Order` and `OrderItems` in a single transaction, and return `201 Created`.

---

## 3. Frontend Component Architecture (React)

1. **`App.jsx`** — Main layout, navigation bar (Storefront, Cart badge count, Admin toggle), and client-side state/routing.
2. **`TopSellersHero.jsx`** — Fetches `GET /api/games?topSellersOnly=true` and highlights flagship titles like *GTA VI* with a quick "Add to Cart" button.
3. **`GameCatalog.jsx`** — Displays the filter bar (Platform dropdown + Search input) and renders a grid of `GameCard` components.
4. **`GameCard.jsx`** — Shows box art, title, platform badge, price, stock status (`In Stock` / `Out of Stock`), and an `Add to Cart` button (disabled when `stock === 0`).
5. **`CartDrawer.jsx`** — Slide-out or modal cart showing selected discs, quantity +/- controls (capped at available stock), subtotal, Customer Name input, and `Checkout` button (`POST /api/orders`).
6. **`AdminPanel.jsx`** — Form to add new game discs (`POST /api/games`) and a quick table to update stock/delete games (`PUT` / `DELETE`).

---

## 4. Seed Data Spec (Initial Database Population)
On first startup, the backend automatically seeds SQLite with:
1. **Grand Theft Auto VI** — PS5 | Action | `$69.99` | Stock: `25` | `IsTopSeller: true`
2. **Grand Theft Auto VI** — Xbox Series X | Action | `$69.99` | Stock: `15` | `IsTopSeller: true`
3. **EA Sports FC 26** — PS5 | Sports | `$59.99` | Stock: `30` | `IsTopSeller: true`
4. **Elden Ring: Shadow of the Erdtree Edition** — PS5 | RPG | `$59.99` | Stock: `10` | `IsTopSeller: false`
5. **The Legend of Zelda: Tears of the Kingdom** — Switch | Adventure | `$59.99` | Stock: `12` | `IsTopSeller: false`
