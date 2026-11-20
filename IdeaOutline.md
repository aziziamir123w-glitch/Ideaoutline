# Project Idea Outline: DiscVault (Physical Game Disc Shop)

## 1. Project Title
**DiscVault** — Physical Video Game CD/Disc Storefront & Inventory Manager

## 2. Problem Statement
Gamers who still collect or prefer physical game discs need a fast, clean storefront to browse available titles, check stock levels, and place orders—while store admins need a simple way to track disc inventory and highlight top sellers like *GTA VI*.

## 3. Target Users
* **Customers (Gamers):** Browse physical game discs by platform (PS5, Xbox, PC), view top sellers, add discs to a cart, and submit orders.
* **Store Admin:** Add new game titles, update prices, and adjust stock counts when discs sell out.

## 4. Core Features (MVP)
1. **Top Sellers Showcase:** A featured banner/section highlighting best-selling titles (e.g., *Grand Theft Auto VI*, *EA Sports FC*, *Elden Ring*) with cover art, platform tags, and prices.
2. **Game Catalog & Filtering:** Browse all available game discs with search by title and filters by platform (PS5, Xbox Series X, Nintendo Switch) and genre.
3. **Shopping Cart & Checkout:** Add/remove physical discs, adjust quantities (respecting available stock), calculate total price, and submit a mock order that deducts stock from the database.
4. **Admin Inventory Management (CRUD):** Simple form/panel to add new game discs, edit pricing/stock, or remove discontinued titles.

## 5. Tech Stack
* **Frontend:** React (Vite + React Router / Axios or Fetch API)
* **Backend:** .NET Core Web API (C# + Entity Framework Core)
* **Database:** SQLite (local `gameshop.db` file for fast setup and portability)
