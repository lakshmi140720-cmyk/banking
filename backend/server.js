const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const db = require("./database");

console.log("Database file loaded");

const app = express();

app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
    res.send("🏦 Bank Backend is Running Successfully!");
});

// Test
app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "API Working"
    });
});

// Login
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err, user) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Username or Password"
                });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Username or Password"
                });
            }

            res.json({
                success: true,
                message: "Login Successful"
            });

        }
    );

});

// Deposit
app.post("/deposit", (req, res) => {

    const { username, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Amount"
        });
    }

    db.run(
        "UPDATE users SET balance = balance + ? WHERE username = ?",
        [amount, username],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            db.run(
                "INSERT INTO transactions(username,type,amount,date) VALUES(?,?,?,?)",
                [
                    username,
                    "Deposit",
                    amount,
                    new Date().toLocaleString()
                ]
            );

            res.json({
                success: true,
                message: "Amount Deposited Successfully"
            });

        }
    );

});

// Send Money
app.post("/send", (req, res) => {

    const { username, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Amount"
        });
    }

    db.get(
        "SELECT balance FROM users WHERE username=?",
        [username],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (row.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient Balance"
                });
            }

            db.run(
                "UPDATE users SET balance = balance - ? WHERE username=?",
                [amount, username],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    db.run(
                        "INSERT INTO transactions(username,type,amount,date) VALUES(?,?,?,?)",
                        [
                            username,
                            "Send",
                            amount,
                            new Date().toLocaleString()
                        ]
                    );

                    res.json({
                        success: true,
                        message: "Money Sent Successfully"
                    });

                }
            );

        }
    );

});

// Balance
app.get("/balance/:username", (req, res) => {

    db.get(
        "SELECT balance FROM users WHERE username=?",
        [req.params.username],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                balance: row.balance
            });

        }
    );

});

// History
app.get("/history/:username", (req, res) => {

    db.all(
        "SELECT * FROM transactions WHERE username=? ORDER BY id DESC",
        [req.params.username],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                history: rows
            });

        }
    );

});

const PORT = 5000;

app.post("/bill", (req, res) => {

    const { username, billType, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Amount"
        });
    }

    db.get(
        "SELECT balance FROM users WHERE username=?",
        [username],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (row.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient Balance"
                });
            }

            db.run(
                "UPDATE users SET balance = balance - ? WHERE username=?",
                [amount, username],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    db.run(
                        "INSERT INTO transactions(username,type,amount,date) VALUES(?,?,?,?)",
                        [
                            username,
                            billType + " Bill",
                            amount,
                            new Date().toLocaleString()
                        ]
                    );

                    res.json({
                        success: true,
                        message: billType + " Bill Paid Successfully"
                    });

                }
            );

        }
    );

});
app.post("/qrpay", (req, res) => {

    const { username, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Amount"
        });
    }

    db.get(
        "SELECT balance FROM users WHERE username=?",
        [username],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (row.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient Balance"
                });
            }

            db.run(
                "UPDATE users SET balance = balance - ? WHERE username=?",
                [amount, username],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    db.run(
                        "INSERT INTO transactions(username,type,amount,date) VALUES(?,?,?,?)",
                        [
                            username,
                            "QR Payment",
                            amount,
                            new Date().toLocaleString()
                        ]
                    );

                    res.json({
                        success: true,
                        message: "QR Payment Successful"
                    });

                }
            );

        }
    );

});
 app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            "INSERT INTO users(username,password,balance) VALUES(?,?,1500)",
            [username, hashedPassword],
            function (err) {

                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "Username already exists"
                    });
                }

                res.json({
                    success: true,
                    message: "Account Created Successfully"
                });

            }
        );

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});
app.post("/transfer", (req, res) => {

    const { sender, receiver, amount } = req.body;

    if (!sender || !receiver || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Details"
        });
    }

    // Sender balance check
    db.get(
        "SELECT balance FROM users WHERE username=?",
        [sender],
        (err, senderRow) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!senderRow) {
                return res.status(404).json({
                    success: false,
                    message: "Sender not found"
                });
            }

            if (senderRow.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient Balance"
                });
            }

            // Receiver check
            db.get(
                "SELECT balance FROM users WHERE username=?",
                [receiver],
                (err, receiverRow) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    if (!receiverRow) {
                        return res.status(404).json({
                            success: false,
                            message: "Receiver not found"
                        });
                    }

                    // Deduct sender balance
                    db.run(
                        "UPDATE users SET balance = balance - ? WHERE username=?",
                        [amount, sender]
                    );

                    // Add receiver balance
                    db.run(
                        "UPDATE users SET balance = balance + ? WHERE username=?",
                        [amount, receiver]
                    );

                    // Sender history
                    db.run(
                        "INSERT INTO transactions(username,type,amount,date) VALUES(?,?,?,?)",
                        [
                            sender,
                            "Transfer to " + receiver,
                            amount,
                            new Date().toLocaleString()
                        ]
                    );

                    // Receiver history
                    db.run(
                        "INSERT INTO transactions(username,type,amount,date) VALUES(?,?,?,?)",
                        [
                            receiver,
                            "Received from " + sender,
                            amount,
                            new Date().toLocaleString()
                        ]
                    );

                    res.json({
                        success: true,
                        message: "Money Transferred Successfully"
                    });

                }
            );

        }
    );

});
app.get("/profile/:username", (req, res) => {

    db.get(
        "SELECT username, fullname, email, mobile, balance FROM users WHERE username=?",
        [req.params.username],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                profile: row
            });

        }
    );

});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
