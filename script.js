// Load Balance & History
let balance = Number(localStorage.getItem("balance")) || 1500;
let history = JSON.parse(localStorage.getItem("history")) || [];
let selectedBill = "";

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("username", username);
            alert("Login Successful");
            window.location.href = "index.html";
        } else {
            document.getElementById("msg").innerText = data.message;
        }

    } catch (err) {
        document.getElementById("msg").innerText =
            "Cannot connect to server!";
    }

}

// ---------------- UPDATE ----------------
function update() {
    let b = document.getElementById("balance");
    if (b) b.innerText = balance;

    let h = document.getElementById("history");
    if (h) {
        h.innerHTML = "";

        history.forEach(item => {
            let li = document.createElement("li");
            li.innerText = item;
            h.appendChild(li);
        });
    }

    localStorage.setItem("balance", balance);
    localStorage.setItem("history", JSON.stringify(history));
}

// ---------------- HISTORY ----------------
function addHistory(text) {
    history.push(text);
    update();
}

// ---------------- DEPOSIT ----------------

       
async function depositPrompt() {
    alert("Deposit function called");

    let amt = Number(prompt("Enter amount to deposit"));

    if (amt <= 0) {
        alert("Invalid Amount");
        return;
    }

    const response = await fetch("http://localhost:5000/deposit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: "admin",
            amount: amt
        })
    });
    console.log(response.status);

    const data = await response.json();

    if (data.success) {

        balance += amt;

        addHistory("💰 Deposited ₹" + amt);

        alert(data.message);

    } else {

        alert(data.message);

    }

}

// ---------------- SEND MONEY ----------------
async function sendPrompt() {
    console.log("Send clicked");

    let amt = Number(prompt("Enter amount to send"));

    if (amt <= 0) {
        alert("Invalid Amount");
        return;
    }

    const response = await fetch("http://localhost:5000/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: "admin",
            amount: amt
        })
    });

    const data = await response.json();
    console.log(data);

    if (data.success) {

        balance -= amt;

        addHistory("💸 Sent ₹" + amt);

        alert(data.message);

    } else {

        alert(data.message);

    }
}
// ---------------- QR ----------------
function goQR() {
    window.location.href = "scan.html";
}

function payQR() {

    let amt = Number(document.getElementById("amt").value);

    if (amt > 0 && amt <= balance) {

        balance -= amt;

        addHistory("📷 QR Payment ₹" + amt);

        alert("QR Payment Successful");

    } else {

        alert("Invalid Amount")
        update();;

    }
}

// ---------------- BILLS ----------------
function goBills() {
    window.location.href = "bills.html";
}

function selectBill(type) {
    selectedBill = type;
    document.getElementById("selectedBill").innerText =
        "Selected : " + type;
}

function payBill() {

    let amt = Number(document.getElementById("billAmount").value);

    if (!selectedBill) {
        alert("Select Bill")
        update();;
        return;
    }

    if (amt > 0 && amt <= balance) {

        balance -= amt;

        addHistory("💡 " + selectedBill + " Bill Paid ₹" + amt);

        alert(selectedBill + " Payment Successful");

    } else {

        alert("Invalid Amount");

    }
}

// ---------------- CONTACT ----------------
function fillUpi() {
    let contact = document.getElementById("sendContact");

    if (contact && document.getElementById("upi")) {
        document.getElementById("upi").value = contact.value;
    }
}

// ---------------- LOAD ----------------
window.onload = function () {
    if (!localStorage.getItem("username")) {

    window.location.href = "login.html";

}

    loadBalance();

    loadHistory();

}
async function loadBalance() {

    const response = await fetch("http://localhost:5000/balance/admin");

    const data = await response.json();

    if (data.success) {

        balance = data.balance;

        update();

    }

}
async function loadHistory() {

    const response = await fetch("http://localhost:5000/history/admin");

    const data = await response.json();

    if (data.success) {

        let h = document.getElementById("history");

        h.innerHTML = "";

        data.history.forEach(item => {

            let li = document.createElement("li");

            li.innerText =
                `${item.type} ₹${item.amount} (${item.date})`;

            h.appendChild(li);

        });

    }

}
async function register() {

    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (username === "" || password === "") {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match");
        return;
    }

    const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();

    document.getElementById("registerMsg").innerText = data.message;

    if (data.success) {

        alert("Account Created Successfully");

        window.location.href = "login.html";

    }

}
async function loadProfile() {

    const username = localStorage.getItem("username");

    const response = await fetch(
        "http://localhost:5000/profile/" + username
    );

    const data = await response.json();

    if (data.success) {

        document.getElementById("fullname").innerText =
            data.profile.fullname;

        document.getElementById("email").innerText =
            data.profile.email;

        document.getElementById("mobile").innerText =
            data.profile.mobile;

        document.getElementById("balance").innerText =
            data.profile.balance;

    }

}
function logout() {

    localStorage.removeItem("username");

    alert("Logged Out Successfully");

    window.location.href = "login.html";

}