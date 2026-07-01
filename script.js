
// Setup starting values
let balance = parseFloat(localStorage.getItem('simple_balance')) || 1500.00;
let history = JSON.parse(localStorage.getItem('simple_history')) || [];
let isLoggedIn = localStorage.getItem('simple_login') === 'true';

// Screen elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const balanceText = document.getElementById('balanceText');
const historyList = document.getElementById('historyList');

// Show the right page when starting
function startPage() {
    if (isLoggedIn) {
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        updateScreen();
    } else {
        loginPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
    }
}

// Check login credentials
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === "admin" && pass === "1234") {
        isLoggedIn = true;
        localStorage.setItem('simple_login', 'true');
        startPage();
    } else {
        alert("Wrong username or password!");
    }
}

// Log out of the account
function logout() {
    isLoggedIn = false;
    localStorage.setItem('simple_login', 'false');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    startPage();
}

// Update the balance and list on screen
function updateScreen() {
    balanceText.textContent = balance.toFixed(2);
    localStorage.setItem('simple_balance', balance);
    localStorage.setItem('simple_history', JSON.stringify(history));
    showHistory();
}

// Add money action
function addMoney() {
    const input = document.getElementById('depositAmount');
    const amount = parseFloat(input.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    balance = balance + amount;
    history.unshift("Deposited $" + amount.toFixed(2));
    input.value = '';
    updateScreen();
}

// Send UPI money action
function sendUpi() {
    const upiId = document.getElementById('upiAddress').value;
    const input = document.getElementById('upiAmount');
    const amount = parseFloat(input.value);

    if (upiId === "" || !upiId.includes("@")) {
        alert("Please enter a correct UPI ID!");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    if (amount > balance) {
        alert("You do not have enough money!");
        return;
    }

    // Ask for PIN to complete payment
    const pin = prompt("Enter your 4-digit UPI PIN (Hint: 9999):");
    if (pin !== "9999") {
        alert("Wrong PIN! Transfer cancelled.");
        return;
    }

    balance = balance - amount;
    history.unshift("Sent $" + amount.toFixed(2) + " to " + upiId);
    document.getElementById('upiAddress').value = '';
    input.value = '';
    updateScreen();
    alert("Money sent successfully!");
}

// Show the list of actions on the screen
function showHistory() {
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<li>No transactions yet.</li>';
        return;
    }

    for (let i = 0; i < history.length; i++) {
        const item = document.createElement('li');
        item.textContent = history[i];
        historyList.appendChild(item);
    }
}

// Run this code on start
startPage();
