import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
const db = window.db;

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addAdminBtn").addEventListener("click", function () {
        const searchDiv = document.getElementById("searchDiv");
        const tableData = document.getElementById("tableData");
        const cardHeader = document.getElementById("cardHeader");
        const cardList = document.getElementById("cardList");

        if (searchDiv) {
            searchDiv.innerHTML = ""; // Clear the content of searchDiv
        }
        if (cardHeader) {
            cardHeader.innerHTML = ""; // Clear the content of cardHeader
        }
        if (cardList) {
            cardList.innerHTML = ""; // Clear the content of cardList
        }

        if (tableData) {
            tableData.innerHTML = ""; // Clear the content of tableData
        }

        CatContainer.innerHTML = `
            <div class="container mt-5">
                <h1>Add New Admin</h1>
                <form id="addAdminForm">
                    <label for="adminFullName">Full Name:</label>
                    <input type="text" id="adminFullName" required><br><br>
                    <label for="adminUsername">Username:</label>
                    <input type="text" id="adminUsername" required><br><br>
                    <label for="adminEmail">Email:</label>
                    <input type="email" id="adminEmail" required><br><br>
                    <label for="adminPassword">Password:</label>
                    <input type="password" id="adminPassword" required><br><br>
                    <button type="submit">Add Admin</button>
                </form>
            </div>
        `;

        addAdmins();
    });
});
function addAdmins() {
    document.getElementById("addAdminForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        const email = document.getElementById("adminEmail").value.trim();
        const username = document.getElementById("adminUsername").value.trim();
        const fullName = document.getElementById("adminFullName").value.trim();
        const password = document.getElementById("adminPassword").value.trim();

        // Validation for Full Name
        if (!fullName || fullName.length < 3) {
            alert("Full Name must be at least 3 characters long.");
            return;
        }

        // Validation for Username
        if (!username || username.length < 3 || /\s/.test(username)) {
            alert("Username must be at least 3 characters long and should not contain spaces.");
            return;
        }

        // Validation for Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Validation for Password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        if (!password) {
            alert("Password cannot be empty.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (!passwordRegex.test(password)) {
            alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        const userData = {
            fullName: fullName,
            userName: username,
            email: email,
            password: password,
            userType: "admin"
        };

        set(ref(db, "users/" + username), userData)
            .then(() => {
                alert("You added a new admin successfully!");
                // Clear fields
                document.getElementById("addAdminForm").reset();
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(error.message + " Please try again.");
            });

        // Optional debug logging
        console.log("Admin data:", userData);
    });
}