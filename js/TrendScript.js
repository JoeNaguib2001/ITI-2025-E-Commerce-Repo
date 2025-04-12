import { ref, push, child, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
const db = window.db;
document.getElementById("trendButton").addEventListener("click", function () {
    LoadTrends();
});

async function LoadTrends() {
    const dbRef = ref(db);

    showLoader();

    // Fetch products from Firebase
    const snapshot = await get(child(dbRef, `carousel_4/`));
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
        const CatContainer = document.getElementById("CatContainer");
        if (CatContainer) CatContainer.innerHTML = ""; // تفريغ الديف ده
        
        const tableContainer = document.getElementById("tableData");
        if (tableContainer) tableContainer.innerHTML = ""; // تفريغ جدول المنتجات السابق
     
        document.querySelector(".cardList").innerHTML = "";
        document.getElementById("searchDiv").innerHTML = "";

        const modalHeader = `
             <h2 class="cardHeader text-center">Products Trend</h2>
        `;
        const divHeader = document.querySelector(".cardHeader");
        divHeader.innerHTML = modalHeader; 
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

    const headers = ["ID", "Title", "Price", "Details",  "Delete"];
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
            showProductDetailsTrend(product);
        });
        tdDetails.appendChild(detailsBtn);
        row.appendChild(tdDetails);
        
        // Delete Button
        const tdDelete = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.addEventListener("click", function() {
            deleteProductFromTrend(product.id);
        });
        tdDelete.appendChild(deleteBtn);
        row.appendChild(tdDelete);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

function createDeleteConfirmModal1() {
    const modalHTML = `
    <div class="modal fade" id="deleteConfirmModal1" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow-lg rounded-4">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="deleteConfirmModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this category? This action cannot be undone.</p>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn1">Delete</button>
                </div>
            </div>
        </div>
    </div>`;

    // التحقق إذا كان المودال موجودًا
    if (!document.getElementById('deleteConfirmModal1')) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper);
    }
}

// Create delete confirmation modal
createDeleteConfirmModal1();

// Add the showProductDetailsTrend function that was missing
function showProductDetailsTrend(product) {
    // Create or get a modal to display product details
    let detailsModal = document.getElementById('productDetailsModal');
    
    if (!detailsModal) {
        // Create the modal if it doesn't exist
        const modalHTML = `
        <div class="modal fade" id="productDetailsModal" tabindex="-1" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content shadow-lg rounded-4">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="productDetailsModalLabel">Product Details</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="productDetailsContent">
                        <!-- Content will be inserted here -->
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        const wrapper = document.createElement("div");
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper);
        
        detailsModal = document.getElementById('productDetailsModal');
    }
    
    // Populate the modal with product details
    const detailsContent = document.getElementById('productDetailsContent');
    
    // Format rating stars if available
    let ratingStars = '';
    if (product.rating && product.rating.rate) {
        const fullStars = Math.floor(product.rating.rate);
        const hasHalfStar = product.rating.rate - fullStars >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            ratingStars += '<i class="bi bi-star-fill text-warning"></i> ';
        }
        
        if (hasHalfStar) {
            ratingStars += '<i class="bi bi-star-half text-warning"></i> ';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            ratingStars += '<i class="bi bi-star text-warning"></i> ';
        }
    }
    
    detailsContent.innerHTML = `
        <div class="row">
            <div class="col-md-5">
                <img src="${product.image}" alt="${product.title}" class="img-fluid rounded mb-3">
            </div>
            <div class="col-md-7">
                <h4>${product.title}</h4>
                <h5 class="text-primary">$${product.price.toFixed(2)}</h5>
                <p class="text-muted">${product.category}</p>
                <div class="mb-3">
                    ${ratingStars} 
                    ${product.rating && product.rating.rate ? `<span class="ms-2">(${product.rating.rate} out of 5, ${product.rating.count} reviews)</span>` : ''}
                </div>
                <p>${product.description}</p>
            </div>
        </div>
    `;
    
    // Show the modal
    const bsModal = new bootstrap.Modal(detailsModal);
    bsModal.show();
}

// Improved delete function with better error handling
async function deleteProductFromTrend(productId) {
    // Verify productId is valid
    if (!productId) {
        ShowBootstrapToast("Invalid product ID", "danger");
        return;
    }
    
    // Show the delete confirmation modal
    const deleteModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal1"));
    deleteModal.show();

    // Add event listener to the confirmation button
    const confirmDeleteBtn1 = document.getElementById("confirmDeleteBtn1");
    confirmDeleteBtn1.onclick = async function () {
        try {
            // Show loader
            showLoader();

            // Reference to the product in Firebase
            const productRef = ref(db, `carousel_4/${productId}`);
            
      
            // Delete the product from Firebase
            await set(productRef, null);

            // Reload data and update the UI
            await LoadTrends();

            // Hide loader
            hideLoader();

            // Hide the modal
            deleteModal.hide();

            // Show success message
            ShowBootstrapToast("Product removed from trends successfully!", "success");
        } catch (error) {
            console.error("Error deleting product:", error);
            ShowBootstrapToast("Failed to delete product: " + error.message, "danger");
            hideLoader();
            deleteModal.hide();
        }
    };
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

// Add a toast notification function if not already defined
function ShowBootstrapToast(message, type = "info") {
    const toastId = "custom-toast-" + Date.now();
    const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
    `;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
        document.body.appendChild(toastContainer);
    }
    
    // Add toast to container
    toastContainer.innerHTML += toastHTML;
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}