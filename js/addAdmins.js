
// import { db } from "../AdminDashboard.html";
// import { ref, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// document.getElementById("addAdmins").addEventListener("click", function (event) {
//     event.preventDefault(); // Prevent page reload
//     addAdmins();
// });

// function addAdmins() {
//     // Get admin details from input fields
//     const email = document.getElementById("adminEmail").value;
//     const username = document.getElementById("adminUsername").value;
//     const fullName = document.getElementById("adminFullName").value;
//     const password = document.getElementById("adminPassword").value;

//     // Validate input fields
//     if (!email || !username || !fullName || !password) {
//         alert("Please fill in all fields.");
//         return;
//     }

//     // Reference to the "admins" node in the Firebase Realtime Database
//     const adminsRef = ref(db, "admins");

//     // Create a new admin object
//     const newAdmin = {
//         email: email,
//         username: username,
//         fullName: fullName,
//         password: password, // Note: Storing plain text passwords is not secure. Consider hashing passwords.
//         userType: "admin", // Default userType for all added admins
//         createdAt: new Date().toISOString()
//     };

//     // Push the new admin to the database
//     push(adminsRef, newAdmin)
//         .then(() => {
//             alert("Admin added successfully!");
//             // Clear input fields
//             document.getElementById("adminEmail").value = "";
//             document.getElementById("adminUsername").value = "";
//             document.getElementById("adminFullName").value = "";
//             document.getElementById("adminPassword").value = "";
//         })
//         .catch((error) => {
//             console.error("Error adding admin:", error);
//             alert("Failed to add admin. Please try again.");
//         });
// }
