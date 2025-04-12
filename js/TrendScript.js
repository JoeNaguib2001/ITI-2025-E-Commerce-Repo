import { ref, push, child, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
const db = window.db;
document.getElementById("trendButton").addEventListener("click", function () {
  
    let cardList = document.getElementById("cardList");
    cardList.innerHTML = "";
    LoadTrends();

});

async function LoadTrends() {
    const dbRef = ref(db);

        showLoader();

        // Fetch products from Firebase
        const snapshot = await get(child(dbRef, `carousel_2/`));
        if (snapshot.exists()) {
            const userData = snapshot.val();

            // Process the products into an array
            const processedProducts = Object.values(userData).map(product => ({
                id: product.id,
                title: product.title,
                price: product.price,
                description: product.description,
                category: product.category,
                image: product.image,
                rating: product.rating
            }));
          
        
            buildTrendProductsTable(processedProducts);
        } else {
            console.error("No products found in Firebase.");
            ShowBootstrapToast("No products found in Firebase.", "danger");             
        }

        hideLoader();
    }


function buildTrendProductsTable(products) {
  
    let container = document.getElementById("tableData");
    if (!container) {
        console.error("Element with ID 'tableData' not found");
        return;
    }
    
    container.innerHTML = "";

    let table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    const headers = ["ID", "Title", "Price", "Details", "Edit", "Delete"];
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(headerText => {
        let th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    products.forEach(product => {
        const row = document.createElement("tr");

        // ID
        const tdId = document.createElement("td");
        tdId.textContent = product.id;
        row.appendChild(tdId);
        
        // Title
        const tdTitle = document.createElement("td");
        tdTitle.textContent = product.title || "N/A";
        row.appendChild(tdTitle);
        
        // Price
        const tdPrice = document.createElement("td");
        tdPrice.textContent = `$${product.price}` || "N/A";
        row.appendChild(tdPrice);
        
        // Details Button
        const tdDetails = document.createElement("td");
        const detailsBtn = document.createElement("button");
        detailsBtn.textContent = "Details";
        detailsBtn.className = "btn btn-info btn-sm";
        detailsBtn.addEventListener("click", function() {
            showProductDetails(product);
        });
        tdDetails.appendChild(detailsBtn);
        row.appendChild(tdDetails);
        
        // Edit Button
        const tdEdit = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "btn btn-warning btn-sm";
        editBtn.addEventListener("click", function() {
            editProduct(product);
        });
        tdEdit.appendChild(editBtn);
        row.appendChild(tdEdit);
        
        // Delete Button
        const tdDelete = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.addEventListener("click", function() {
            deleteProduct(product.id);
        });
        tdDelete.appendChild(deleteBtn);
        row.appendChild(tdDelete);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}
function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "block";
    } else {
        // إنشاء مؤشر التحميل إذا لم يكن موجودًا
        const loaderHTML = `
        <div id="loader" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style="z-index: 9999;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;
        
        const loaderDiv = document.createElement("div");
        loaderDiv.innerHTML = loaderHTML;
        document.body.appendChild(loaderDiv.firstChild);
    }
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none";
    }
}