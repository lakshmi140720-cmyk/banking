const sqlite3 = require("sqlite3").verbose();

// Create/Open Database
const db = new sqlite3.Database("./bank.db", (err) => {
    if (err) {
        console.error("Database Error:", err.message);
    } else {
        console.log("✅ Connected to SQLite Database");
    }
});

// Create Users Table
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    balance REAL DEFAULT 1500
)
`);

// Create Transactions Table
db.run(`
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    type TEXT,
    amount REAL,
    date TEXT
)
`);
db.run(`
INSERT OR IGNORE INTO users(username, password, balance)
VALUES ('admin', '1234', 1500)
`);
module.exports = db;