//load navbar
//update cart count
//update sign button
//update Hello span
//setup search functionality
//toggle sign in
//go to cart if signed in

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
        updateSpans(getStoredName());

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
        let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        productsCount.innerHTML = totalItems;
        console.log("✅ تم تحديث عدد المنتجات في السلة:", totalItems);
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

        debounceTimer = setTimeout(() => {
            if (document.body.classList.contains("shop-page")) {
                searchProducts(query);
            } else {
                localStorage.setItem("searchQuery", query);
                window.location.href = "shop.html";
            }
        }, 2000); // ⏳ تأخير التنفيذ لمدة ثانيتين
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

// ✅ جلب الاسم من `localStorage`
function getStoredName() {
    return localStorage.getItem("username") || "Default User";
}

// ✅ تحديث الاسم في النافبار
function updateSpans(name) {
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
fetch("Accounts.json")
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(accounts => {
        const currentUser = localStorage.getItem("username");
        const user = accounts.find(account => account.username === currentUser);
        if (user) {
            currentUserRole = user.role;
            if (currentUserRole === "admin") {
                document.querySelector(".admin-dropdown").style.display = "block";
                document.querySelector(".user-dropdown").style.display = "none";
            } else {
                document.querySelector(".admin-dropdown").style.display = "none";
                document.querySelector(".user-dropdown").style.display = "block";
            }
        } else {
            document.querySelector(".admin-dropdown").style.display = "none";
            document.querySelector(".user-dropdown").style.display = "block";
        }
    })
    .catch(error => {
        console.error("❌ Error fetching Accounts.json:", error);
    }); {
}


function showOrder() {
    if (localStorage.getItem("isSignedIn") == "true") {
        window.location.href = "orders.html";
    }
    else {
        alert("You need to sign in first!");
        window.location.href = "login.html";
    }

}




//Bootstrap Toast Function
function ShowBootstrapToast(message, type) {
    let toastEl = document.getElementById("bootstrapToast");
    let toastBody = document.getElementById("toastMessage");
    let toastHeader = document.getElementById("toastTitle");

    // تغيير لون العنوان حسب نوع الرسالة
    let bgColor = type === "success" ? "text-success" : "text-danger";
    toastHeader.className = `me-auto ${bgColor}`;

    // تعيين الرسالة
    toastBody.innerText = message;

    // عرض التوست
    let toast = new bootstrap.Toast(toastEl);
    toast.show();
}


