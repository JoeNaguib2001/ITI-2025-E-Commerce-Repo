//load navbar
//update cart count
//update sign button
//update Hello span
//setup search functionality
//toggle sign in
//go to cart if signed in

import { ref, child, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


// Access the globally initialized database
const db = window.db;
async function loadNavbar() {
    try {
        //this is the navbar element in the html page that wants to load the navbar
        //if the navbar element is not found, create a new div element and add it to the body
        let navbarElement = document.getElementById("navbar");

        if (!navbarElement) {
            navbarElement = document.createElement("div");
            navbarElement.id = "navbar";
            document.body.prepend(navbarElement);
        }

        const response = await fetch("navbar/navbar.html");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.text();
        navbarElement.innerHTML = data;

        updateCartCount();
        updateSignButton();
        getStoredName().then(name => updateHelloCustomerName(name));

        setupSearchFunctionality();



    } catch (error) {
        console.error("❌ حدث خطأ أثناء تحميل النافبار:", error);
    }


}

// ✅ تحديث عدد المنتجات في السلة
function updateCartCount() {
    if (localStorage.getItem("isSignedIn") == "false") {
        return;
    }
    let productsCount = document.querySelector(".products-count");
    if (productsCount) {
        let username = localStorage.getItem("username");
        let carts = JSON.parse(localStorage.getItem("carts")) || [];
        let userCart = carts.find(cart => cart.username === username);

        if (userCart && userCart.order) {
            let totalItems = Object.values(userCart.order).reduce((sum, item) => sum + item.quantity, 0);
            productsCount.innerHTML = totalItems;
        } else {
            productsCount.innerHTML = 0;
        }
    }
}


function setupSearchFunctionality() {
    let searchBar = document.getElementById("search-box");

    if (!searchBar) {
        console.warn("⚠️ لم يتم العثور على شريط البحث.");
        return;
    }

    let debounceTimer; // ⏳ متغير لتأخير البحث

    searchBar.addEventListener("input", function () {
        clearTimeout(debounceTimer); // ⛔ مسح أي مؤقت قديم

        let query = searchBar.value.trim().toLowerCase();

        searchProducts(query);

        // debounceTimer = setTimeout(() => {
        //     if (document.body.classList.contains("shop-page")) {
        //     } else {
        //         localStorage.setItem("searchQuery", query);
        //         window.location.href = "shop.html";
        //     }
        // }, 2000); // ⏳ تأخير التنفيذ لمدة ثانيتين
    });

    // ✅ تشغيل البحث مباشرة لو جاي من صفحة تانية
    let storedQuery = localStorage.getItem("searchQuery");
    if (document.body.classList.contains("shop-page") && storedQuery) {
        searchBar.value = storedQuery;
        searchProducts(storedQuery);
    }
}



// ✅ تحديث زر تسجيل الدخول
function updateSignButton() {
    let signButton = document.querySelectorAll(".login-btn");
    signButton.forEach(button => {
        if (localStorage.getItem("isSignedIn") == "true") {
            button.innerHTML = "Sign Out";
            button.addEventListener("click", toggleSingedIn);
        } else {
            button.innerHTML = "Sign In";
            button.addEventListener("click", () => window.location.href = "login.html");
        }
    });
    if (signButton) {
        signButton.innerHTML = localStorage.getItem("isSignedIn") == "true" ? "Sign Out" : "Sign In";
    }
}

    async function getStoredName() {
        console.log("Fetching user data from Firebase...");
        const dbRef = ref(db); 


        try {
            const snapshot = await get(child(dbRef, `users/${localStorage.getItem("username")}`)); 
            if (snapshot.exists()) {
                const userData = snapshot.val(); 
                const fullName = userData.fullName; 


                if (fullName) {
                    const nameParts = fullName.split(" "); 
                    const firstName = nameParts[0]; 
                    return firstName;
                } else {
                    return null; 
                }
            } else {
                return null; 
            }
        } catch (error) {
            console.error("Error fetching user data from Firebase:", error);
            return null;
        }
    }
    

// ✅ تحديث الاسم في النافبار
function updateHelloCustomerName(name) {
    let span = document.querySelector("span.hello-span");
    if (span) span.innerHTML = `Hello, ${name}`;
}

// ✅ تحميل النافبار عند تشغيل الصفحة
loadNavbar();


function toggleSingedIn() {
    if (localStorage.getItem("isSignedIn") == "true") {
        localStorage.setItem("isSignedIn", "false");
        localStorage.setItem("username", "Default User");
        localStorage.setItem("rememberMe", "false");
    }
    window.location.href = "login.html";
}

/////////////////////////////////////////////////////////////////////
function goToCartIfSignedIn() {
    if (localStorage.getItem("isSignedIn") == "true") {
        window.location.href = "shopping-cart.html";
    }
    else {
        ShowBootstrapToast("You have To Sign In First To Show Your Shopping Cart", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
    }
}

function toggleMenu() {
    const menu = document.getElementById("userMenu");
    const fiterCategoryArea = document.querySelector(".filter-category-area");
    const filterCategory = document.querySelector(".filter-category");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
    fiterCategoryArea.style.opacity = "0.5";

}


// Choose the right dropdown menu based on the user role
const dbRef = ref(db);

// Retrieve the current username from localStorage
const username = localStorage.getItem("username");

if (!username) {
    console.error("No username found in localStorage.");
    return;
}

// Fetch user data from Firebase
get(child(dbRef, `users/${username}`))
    .then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const currentUserRole = userData.userType;

            // Show/hide dropdown menus based on the user role
            if (currentUserRole === "admin") {
                document.querySelector(".admin-dropdown").style.display = "block";
                const userDropdown = document.querySelector(".user-dropdown");
                if (userDropdown) userDropdown.remove();
            } else {
                const adminDropdown = document.querySelector(".admin-dropdown");
                if (adminDropdown) adminDropdown.remove();
                document.querySelector(".user-dropdown").style.display = "block";
            }
        } else {
            console.error("User not found in Firebase.");
            const adminDropdown = document.querySelector(".admin-dropdown");
            if (adminDropdown) adminDropdown.remove();
            document.querySelector(".user-dropdown").style.display = "block";
        }
    })
    .catch((error) => {
        console.error("Error fetching user data from Firebase:", error);
    });


function showOrder() {
    if (localStorage.getItem("isSignedIn") == "true") {
        window.location.href = "orders.html";
    }
    else {
        ShowBootstrapToast("You have To Sign In First To Show Your Orders", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
        window.location.href = "login.html";
    }

}






