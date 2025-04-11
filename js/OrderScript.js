import { ref, child, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {
    
    loadOrders();
    const navLinks = document.querySelectorAll('.nav-bar-links .nav-link');

    navLinks.forEach(link => {

        link.addEventListener('click', function() {

            const allListItems = document.querySelectorAll('.nav-bar-links li');
            allListItems.forEach(item => item.classList.remove('active'));

            this.parentElement.classList.add('active');  
        });
    });

    document.getElementById("OrderButton").addEventListener("click", function () {
        loadOrders();
    });
});

// Function to show the loader
function showLoader() {
    document.getElementById("loadingSpinner").style.display = "flex"; // Show the spinner
}

// Function to hide the loader
function hideLoader() {
    document.getElementById("loadingSpinner").style.display = "none"; // Hide the spinner
}



let allOrders = []; 

// async function loadOrders() {
//     try {
//             showLoader();

//         const response = await fetch('./Data/Orders.json');
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch orders data');
//         }
//         const data = await response.json(); 

//         const processedOrders = data.map(order => ({
//             id: order.orderId,
//             userName: order.userName,
//             orderDate: order.orderDate,
//             estimatedDelivery: order.estimatedDelivery,
//             paymentMethod: order.paymentMethod,
//             totalPrice: order.totalPrice,
//             orderStatus: order.orderStatus,
//             order: order.order 
//         }));

//         for (let item of processedOrders) {
//             allOrders.push(item);
//         }
//         let searchDiv = document.getElementById("searchDiv");
//         searchDiv.innerHTML = "";
//         createDateFilter();

//         console.log(processedOrders);
//         const CatContainer = document.getElementById("CatContainer");
//          CatContainer.innerHTML = "";
//         createOrderCardModal(processedOrders); // تحديث البطاقات
//         buildOrderTable(processedOrders);
//         hideLoader();
//     } catch (error) {
//         console.error('Failed to load orders:', error);
//         alert("There was an error loading the orders. Please try again later.");
//         hideLoader();

//     }
// }
async function loadOrders() {
    const dbRef = ref(db);

    try {
        showLoader();

        // Fetch orders from Firebase
        const snapshot = await get(child(dbRef, `orders/`));
        if (snapshot.exists()) {
            const userData = snapshot.val();

            // Process the orders into an array
            const processedOrders = Object.values(userData).map(order => ({
                id: order.orderId,
                userName: order.userName,
                orderDate: order.orderDate,
                estimatedDelivery: order.estimatedDelivery,
                paymentMethod: order.paymentMethod,
                totalPrice: order.totalPrice,
                orderStatus: order.orderStatus,
                order: order.order
            }));

            // Add processed orders to the global `allOrders` array
            allOrders = processedOrders;

            // Clear and update the search div
            let searchDiv = document.getElementById("searchDiv");
            searchDiv.innerHTML = "";
            createDateFilter();

            console.log(processedOrders);

            // Update the UI with the fetched orders
            const CatContainer = document.getElementById("CatContainer");
            CatContainer.innerHTML = "";
            createOrderCardModal(processedOrders); // Update cards
            buildOrderTable(processedOrders);

            hideLoader();
        } else {
            console.error("No orders found in Firebase.");
            hideLoader();
        }
    } catch (error) {
        console.error("Failed to load orders:", error);
        alert("There was an error loading the orders. Please try again later.");
        hideLoader();
    }
}

function createOrderCardModal(orders) {
    const totalOrders = orders.length;
    const totalProducts = orders.reduce((total, order) => total + order.order.reduce((productTotal, product) => productTotal + product.quantity, 0), 0);
    const totalCustomers = new Set(orders.map(order => order.userName)).size;
    const totalRevenue = orders.reduce((total, order) => total + parseFloat(order.totalPrice), 0);

    const modalHeader = `
         <h2 class="cardHeader text-center">Orders Analysis</h2>
`;
    const modalHTML =`
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Orders</h3>
                <p class="card-number">${totalOrders}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Products</h3>
                <p class="card-number">${totalProducts}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Customers</h3>
                <p class="card-number">${totalCustomers}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Sales</h3>
                <p class="card-number">$${totalRevenue.toLocaleString()}</p>
            </div>s
        </div>

    `;
    const divHeader = document.querySelector(".cardHeader");
    divHeader.innerHTML = modalHeader; 
    const div = document.querySelector(".cardList");
    div.innerHTML = modalHTML;  // إحذف أي محتوى قديم وأضف الجدد
}

// حذف وظيفة OrderDetailsCard لأنها غير ضرورية وتسبب مشاكل

function createDateFilter() {
    // إنشاء العناصر داخل الـ DOM
    const searchDiv = document.getElementById("searchDiv");
    const dateFilterDiv = document.createElement('div');
    dateFilterDiv.classList.add('date-filter');
    
    // إنشاء input للبداية
    const startDateInput = document.createElement('input');
    startDateInput.type = 'date';
    startDateInput.id = 'startDate';
    startDateInput.placeholder = 'Start Date';
    
    // إنشاء input للنهاية
    const endDateInput = document.createElement('input');
    endDateInput.type = 'date';
    endDateInput.id = 'endDate';
    endDateInput.placeholder = 'End Date';
    
    // إنشاء زر البحث
    const searchBtn = document.createElement('button');
    searchBtn.id = 'searchBtn';
    searchBtn.textContent = 'Search';
    
    // إضافة المدخلات والأزرار إلى div
    dateFilterDiv.appendChild(startDateInput);
    dateFilterDiv.appendChild(endDateInput);
    dateFilterDiv.appendChild(searchBtn);
    
    // إضافة div إلى العنصر الرئيسي في الـ DOM (مثل body أو عنصر آخر)
    searchDiv.appendChild(dateFilterDiv); // يمكن تغيير هذا إلى أي عنصر آخر تريده
}


document.getElementById("searchBtn").addEventListener("click", function() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (startDate && endDate) {
        const filteredOrders = filterOrdersByDate(allOrders, startDate, endDate);
        buildTable(filteredOrders);
    }
    else {
        alert("Please select both start and end dates.");
    }
});

function filterOrdersByDate(orders, startDate, endDate) {
    return orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return orderDate >= start && orderDate <= end;
    });
}

function buildOrderTable(orders) {

    let container = document.getElementById("tableData");
    container.innerHTML = "";

    let table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    const headers = ["ID", "Username", "Order Date", "Estimated Delivery", "Payment", "TotalPrice", "Status"];
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

    orders.forEach(order => {
        const row = document.createElement("tr");

        Object.keys(order).forEach(key => {
            const td = document.createElement("td");

            if (key === "id") {
                const aIdRef = document.createElement("a");
                aIdRef.href = "#";
                aIdRef.textContent = order[key];
                
                aIdRef.addEventListener("click", function (e) {
                    e.preventDefault();
                    showOrderDetails(order);
                });

                td.appendChild(aIdRef);
            }else if (key === "order"){
                td.style.display = "none"; 
            } 
            else if (key === "orderStatus") {
                const select = document.createElement("select");
                const statuses = ["Waiting", "InProgress", "Delivered", "Declined"];
                
                statuses.forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    option.selected = order.orderStatus === status;
                    select.appendChild(option);
                });

                select.addEventListener("change", async () => {
                    try {
                        const response = await fetch(
                            `http://localhost:3000/ChangeStatus`,
                            {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: order.id, orderStatus: select.value })
                            }
                        );

                        if (response.ok) {
                            console.log('Status updated successfully!');
                            loadOrders();
                        }
                    } catch (error) {
                        console.error('Failed to update status:', error);
                        alert("Failed to update the status. Please try again.");
                    }
                });

                td.appendChild(select);
            } else {
                td.textContent = order[key] || "N/A";  // Default value if key is missing
            }

            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

async function showOrderDetails(order) {
    let modalElement = document.getElementById("orderDetailsModal");
    if (!modalElement) {
        createModal();
        modalElement = document.getElementById("orderDetailsModal");
    }

    // تصحيح: استخدام order.id بدلاً من order.orderId الذي قد لا يكون موجوداً
    document.getElementById('modalOrderId').textContent = order.id || "N/A";
    document.getElementById('modalUsername').textContent = order.userName || "N/A";
    document.getElementById('modalOrderDate').textContent = order.orderDate || "N/A";
    document.getElementById('modalEstimatedDelivery').textContent = order.estimatedDelivery || "N/A";
    document.getElementById('modalPaymentMethod').textContent = order.paymentMethod || "N/A";
    document.getElementById('modalTotalPrice').textContent = order.totalPrice ? `${order.totalPrice} EGP` : "N/A";
    document.getElementById('modalOrderStatus').textContent = order.orderStatus || "N/A";

    let productDetailsContainer = document.getElementById("modalProductDetails");
    productDetailsContainer.innerHTML = "";
    if (order.order && (Array.isArray(order.order) && order.order.length > 0 || typeof order.order === 'object')) {
        const products = Array.isArray(order.order) ? order.order : [order.order];
        
        for (let item of products) {
            // await updateProductStatus(order.id, item.id, "Pending");
            
            const productHTML = `
            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <img src="${item.image}" alt="${item.title}" class="img-fluid rounded-3">
                </div>
                <div class="col-md-8">
                    <h5 class="fw-bold">${item.title}</h5>
                    <p class="mb-1"><strong>Price:</strong> ${item.price} EGP</p>
                    <p class="mb-1"><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p><strong>Rating:</strong> ${item.rating.rate} (${item.rating.count} reviews)</p>
        
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-success" onclick="updateProductStatus(${order.id}, ${item.id}, 'Accepted')">Accept</button>
                        <button class="btn btn-danger" onclick="updateProductStatus(${order.id}, ${item.id}, 'Rejected')">Reject</button>
                    </div>
                </div>
            </div>
        `;
        
            productDetailsContainer.innerHTML += productHTML;
        }
    } else {
        productDetailsContainer.innerHTML = "<p>No products found for this order.</p>";
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function createModal() {
    const modalHTML = `
    <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg rounded-4">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title" id="orderDetailsModalLabel">Order #<span id="modalOrderId"></span> Details</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label fw-bold">Username</label><p id="modalUsername" class="form-control-plaintext border rounded px-3 py-2 bg-light"></p></div>
              <div class="col-md-6"><label class="form-label fw-bold">Order Date</label><p id="modalOrderDate" class="form-control-plaintext border rounded px-3 py-2 bg-light"></p></div>
              <div class="col-md-6"><label class="form-label fw-bold">Estimated Delivery</label><p id="modalEstimatedDelivery" class="form-control-plaintext border rounded px-3 py-2 bg-light"></p></div>
              <div class="col-md-6"><label class="form-label fw-bold">Payment Method</label><p id="modalPaymentMethod" class="form-control-plaintext border rounded px-3 py-2 bg-light"></p></div>
              <div class="col-md-6"><label class="form-label fw-bold">Total Price</label><p id="modalTotalPrice" class="form-control-plaintext border rounded px-3 py-2 bg-light"></p></div>
              <div class="col-md-6"><label class="form-label fw-bold">Order Status</label><p id="modalOrderStatus" class="form-control-plaintext border rounded px-3 py-2 bg-light text-capitalize"></p></div>
            </div>

            <div id="modalProductDetails"></div>

          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>`;

    const div = document.createElement("div");
    div.innerHTML = modalHTML;
    document.body.appendChild(div);
}

async function updateProductStatus(orderId, productId, newStatus) {
    const url = 'http://localhost:3000/update-product-status';
    
    const body = {
        orderId: orderId,
        productId: productId,
        newStatus: newStatus
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('تم تحديث حالة المنتج بنجاح:', data);
        } else {
            const errorData = await response.json();
            console.log('حدث خطأ:', errorData.error);
        }
    } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
    }
}