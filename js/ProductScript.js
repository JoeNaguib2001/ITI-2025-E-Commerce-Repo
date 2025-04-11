import { ref, child, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
const db = window.db;
document.getElementById("productButton").addEventListener("click", function () {
    loadProducts();
});

async function loadProducts() {
    const dbRef = ref(db);

    try {
        showLoader();

        // Fetch products from Firebase
        const snapshot = await get(child(dbRef, `products/`));
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

            let searchDiv = document.getElementById("searchDiv");
            searchDiv.innerHTML = "";
            CreateSearchFilter();
            console.log(processedProducts);
            CreateCategoriesUi();
            createProductCardModal(processedProducts); // Update product cards
            buildProductTable(processedProducts);
        } else {
            console.warn("No products found in the database.");
        }

        hideLoader();
    } catch (error) {
        console.error('Failed to load products:', error);
        alert("There was an error loading the products. Please try again later.");
        hideLoader();
    }
}

// استبدال المحتوى كاملًا:
async function FetchCategoriseFromJsonFile() {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      return [];
    }
  }

async function CreateCategoriesUi() {
    // إضافة async لأن الدالة تستخدم await
    const categoriesFromJson = await FetchCategoriseFromJsonFile();

    const categories = [];
    categoriesFromJson.forEach(category => {
        categories.push(category);
    });
    
    const CatContainer = document.getElementById("CatContainer");
    CatContainer.innerHTML = "";
    const catHeader = document.createElement("h2");
    catHeader.className = "catHeader text-center"; 
    catHeader.textContent = "Browse Categories";
    CatContainer.appendChild(catHeader);
    
    // إنشاء القائمة
    const categoryList = document.createElement("ul");
    categoryList.className = "list-unstyled d-flex flex-wrap justify-content-start";
    categoryList.style.margin = "10px";
    CatContainer.appendChild(categoryList);
    
    // إنشاء زر إضافة تصنيف جديد
    const addNewBtn = document.createElement("button");
    addNewBtn.textContent = "Add New Category";
    addNewBtn.className = "btn btn-primary mb-3 ml-auto";
    addNewBtn.style.padding = "12px 40px";
    addNewBtn.style.margin = "30px";
    CatContainer.appendChild(addNewBtn);

    // إنشاء المودال للتصنيفات
    createCategoryModal();

    // إظهار المودال عند النقر على الزر
    addNewBtn.addEventListener("click", () => {
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    });

    // معالجة حدث الحفظ
    const saveBtn = document.getElementById("saveCategoryBtn");
    saveBtn.addEventListener("click", async () => { // Add async here
        const name = document.getElementById("categoryNameInput").value.trim();
        const desc = document.getElementById("categoryDescInput").value.trim();
    
        if (!name || !desc) {
            alert("Please fill in all fields");
            return;
        }
    
        try {
            // 1. Send data to server
            const response = await fetch('http://localhost:3000/api/categories', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ name, description: desc })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            // 2. Get updated category from server
            const newCategory = await response.json();
            
            // 3. Update local state with server response
            categories.push(newCategory);
            
            // 4. Update UI
            renderCategories();
            
            // 5. Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            document.getElementById("categoryForm").reset(); // Add form ID to your form
    
        } catch (error) {
            console.error('Save Error:', error);
            alert(`Failed to save category: ${error.message}`);
        }
    });

    // دالة عرض التصنيفات
    function renderCategories() {
        categoryList.innerHTML = "";
        categoryList.className = "category-list";
    
        categories.forEach(cat => {
            const li = document.createElement("li");
            li.className = "category-item";
    
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = cat.name;
            link.className = "category-link";
    
            link.addEventListener("click", () => {
                console.log(`عرض جدول المنتجات لـ ${cat.name}`);
                // هنا يجب إضافة منطق تصفية المنتجات حسب التصنيف
                filterProductsByCategory(cat.name);
            });
    
            li.appendChild(link);
            categoryList.appendChild(li);
        });
    }
    
    // عرض التصنيفات الموجودة مباشرة بعد جلب البيانات
    renderCategories();
}

// دالة لتصفية المنتجات حسب التصنيف
function filterProductsByCategory(categoryName) {
    if (!allProducts || allProducts.length === 0) {
        console.error("No products data available");
        return;
    }
    
    const filteredProducts = categoryName.toLowerCase() === 'all' 
        ? allProducts 
        : allProducts.filter(product => 
            product.category && product.category.toLowerCase() === categoryName.toLowerCase()
        );
        
    // تحديث جدول المنتجات بالمنتجات المصفاة
    buildProductTable(filteredProducts);
    
    // تحديث بطاقات التحليل للمنتجات المصفاة
    createProductCardModal(filteredProducts);
}

function createCategoryModal() {
    const modalHTML = `
    <div class="modal fade" id="categoryModal" tabindex="-1" aria-labelledby="categoryModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow-lg rounded-4">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="categoryModalLabel">Create New Category</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="categoryNameInput" class="form-label fw-bold">Category Name</label>
                        <input type="text" class="form-control" id="categoryNameInput" placeholder="Enter category name">
                    </div>
                    <div class="mb-3">
                        <label for="categoryDescInput" class="form-label fw-bold">Description</label>
                        <input type="text" class="form-control" id="categoryDescInput" placeholder="Enter description">
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" id="saveCategoryBtn">Create</button>
                </div>
            </div>
        </div>
    </div>`;

    // التحقق مما إذا كان المودال موجودًا بالفعل
    if (!document.getElementById('categoryModal')) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper);
    }
}

function createProductCardModal(products) {
    // تم تغيير المعامل من f إلى products للتوضيح
    const totalProducts = products.length;

    const totalRevenue = products.reduce((total, product) => total + parseFloat(product.price), 0);

    const avgRating = products.reduce((total, product) => total + (product.rating?.rate || 0), 0) / totalProducts;

    const modalHeader = `
        <h2 class="cardHeader text-center">Products Analysis</h2>
    `;

    // إنشاء محتوى التقارير
    const modalHTML = `
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Products</h3>
                <p class="card-number">${totalProducts}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Total Revenue</h3>
                <p class="card-number">$${totalRevenue.toLocaleString()}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-content">
                <h3 class="card-title">Average Rating</h3>
                <p class="card-number">${avgRating.toFixed(2)}</p>
            </div>
        </div>
    `;

    // تحديث العنوان والمحتوى
    const divHeader = document.querySelector(".cardHeader");
    if (divHeader) {
        divHeader.innerHTML = modalHeader;
    }

    const div = document.querySelector(".cardList");
    if (div) {
        div.innerHTML = modalHTML;  // إحذف أي محتوى قديم وأضف الجديد
    }
}

function buildProductTable(products) {
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

// دالة عرض تفاصيل المنتج
async function showProductDetails(product) {
    try {
        // إظهار المؤشر أثناء جلب البيانات
        showLoader();
        
        // استعلام الخادم للحصول على تفاصيل محدثة للمنتج
        const response = await fetch(`http://localhost:3000/api/products/${product.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }
        
        const productDetails = await response.json();
        
        // إنشاء أو الحصول على عنصر المودال
        let modalElement = document.getElementById("productDetailsModal");
        if (!modalElement) {
            createProductModal();
            modalElement = document.getElementById("productDetailsModal");
        }

        // ملء بيانات المودال بتفاصيل المنتج
        document.getElementById('modalProductId').textContent = productDetails.id || "N/A";
        document.getElementById('modalProductTitle').textContent = productDetails.title || "N/A";
        document.getElementById('modalProductPrice').textContent = productDetails.price ? `$${productDetails.price}` : "N/A";
        document.getElementById('modalProductDescription').textContent = productDetails.description || "N/A";
        document.getElementById('modalProductCategory').textContent = productDetails.category || "N/A";
        
        // تعيين صورة المنتج
        const imgElement = document.getElementById('modalProductImage');
        if (imgElement) {
            imgElement.src = productDetails.image || "/placeholder.jpg";
            imgElement.alt = productDetails.title || "Product Image";
        }
        
        // عرض معلومات التقييم
        if (productDetails.rating) {
            document.getElementById('modalProductRating').textContent = productDetails.rating.rate || "N/A";
            document.getElementById('modalProductReviews').textContent = productDetails.rating.count || "N/A";
        } else {
            document.getElementById('modalProductRating').textContent = "N/A";
            document.getElementById('modalProductReviews').textContent = "N/A";
        }
        
        // إخفاء المؤشر
        hideLoader();
        
        // عرض المودال
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to load product details. Please try again later.");
        hideLoader();
    }
}

// دالة تعديل المنتج
async function editProduct(product) {
    try {
        // إظهار المؤشر
        showLoader();
        
        // جلب بيانات المنتج الحالية
        const response = await fetch(`http://localhost:3000/api/products/${product.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch product for editing');
        }
        
        const productData = await response.json();
        
        // إنشاء أو الحصول على عنصر مودال التحرير
        let editModalElement = document.getElementById("editProductModal");
        if (!editModalElement) {
            createEditProductModal();
            editModalElement = document.getElementById("editProductModal");
        }
        
        // ملء النموذج ببيانات المنتج
        document.getElementById('editProductId').value = productData.id || "";
        document.getElementById('editProductTitle').value = productData.title || "";
        document.getElementById('editProductPrice').value = productData.price || "";
        document.getElementById('editProductDescription').value = productData.description || "";
        document.getElementById('editProductCategory').value = productData.category || "";
        document.getElementById('editProductImage').value = productData.image || "";
        
        if (productData.rating) {
            document.getElementById('editProductRating').value = productData.rating.rate || "";
            document.getElementById('editProductCount').value = productData.rating.count || "";
        }
        
        // إخفاء المؤشر
        hideLoader();
        
        // عرض المودال
        const modal = new bootstrap.Modal(editModalElement);
        modal.show();
        
        // إضافة معالج حدث زر الحفظ
        const saveButton = document.getElementById('saveEditProductBtn');
        saveButton.onclick = function() {
            saveProductChanges();
        };
    } catch (error) {
        console.error("Error preparing product for edit:", error);
        alert("Failed to load product for editing. Please try again later.");
        hideLoader();
    }
}

// دالة حفظ تغييرات المنتج
async function saveProductChanges() {
    try {
        // إظهار المؤشر
        showLoader();
        
        // جمع البيانات من النموذج
        const productId = document.getElementById('editProductId').value;
        const updatedProduct = {
            id: productId,
            title: document.getElementById('editProductTitle').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            description: document.getElementById('editProductDescription').value,
            category: document.getElementById('editProductCategory').value,
            image: document.getElementById('editProductImage').value,
            rating: {
                rate: parseFloat(document.getElementById('editProductRating').value),
                count: parseInt(document.getElementById('editProductCount').value)
            }
        };
        
        // إرسال البيانات المحدثة إلى الخادم
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        
        // إغلاق المودال
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
        
        // إعادة تحميل البيانات وتحديث العرض
        loadProducts();
        
        // إخفاء المؤشر
        hideLoader();
        
        // إظهار رسالة نجاح
        alert("Product updated successfully!");
    } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update product. Please try again later.");
        hideLoader();
    }
}

// دالة حذف المنتج
async function deleteProduct(productId) {
    // طلب تأكيد من المستخدم
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }
    
    try {
        // إظهار المؤشر
        showLoader();
        
        // إرسال طلب حذف إلى الخادم
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        // إعادة تحميل البيانات وتحديث العرض
        loadProducts();
        
        // إخفاء المؤشر
        hideLoader();
        
        // إظهار رسالة نجاح
        alert("Product deleted successfully!");
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again later.");
        hideLoader();
    }
}

// إنشاء مودال تفاصيل المنتج
function createProductModal() {
    const modalHTML = `
    <div class="modal fade" id="productDetailsModal" tabindex="-1" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="productDetailsModalLabel">Product #<span id="modalProductId"></span> Details</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-4">
                <img id="modalProductImage" src="" alt="Product Image" class="img-fluid rounded-3">
              </div>
              <div class="col-md-8">
                <h4 id="modalProductTitle" class="fw-bold"></h4>
                <p><strong>Price:</strong> <span id="modalProductPrice"></span></p>
                <p><strong>Category:</strong> <span id="modalProductCategory"></span></p>
                <p><strong>Rating:</strong> <span id="modalProductRating"></span> (<span id="modalProductReviews"></span> reviews)</p>
                <p><strong>Description:</strong> <span id="modalProductDescription"></span></p>
              </div>
            </div>
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

// إنشاء مودال تعديل المنتج
function createEditProductModal() {
    const modalHTML = `
    <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg rounded-4">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title" id="editProductModalLabel">Edit Product</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editProductForm">
              <input type="hidden" id="editProductId">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="editProductTitle" class="form-label">Product Title</label>
                  <input type="text" class="form-control" id="editProductTitle" required>
                </div>
                <div class="col-md-6">
                  <label for="editProductPrice" class="form-label">Price</label>
                  <input type="number" class="form-control" id="editProductPrice" step="0.01" required>
                </div>
                <div class="col-md-6">
                  <label for="editProductCategory" class="form-label">Category</label>
                  <input type="text" class="form-control" id="editProductCategory" required>
                </div>
                <div class="col-md-6">
                  <label for="editProductImage" class="form-label">Image URL</label>
                  <input type="text" class="form-control" id="editProductImage">
                </div>
                <div class="col-md-6">
                  <label for="editProductRating" class="form-label">Rating</label>
                  <input type="number" class="form-control" id="editProductRating" step="0.1" min="0" max="5">
                </div>
                <div class="col-md-6">
                  <label for="editProductCount" class="form-label">Review Count</label>
                  <input type="number" class="form-control" id="editProductCount" min="0">
                </div>
                <div class="col-12">
                  <label for="editProductDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="editProductDescription" rows="3" required></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveEditProductBtn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>`;

    const div = document.createElement("div");
    div.innerHTML = modalHTML;
    document.body.appendChild(div);
}

// دوال إظهار وإخفاء مؤشر التحميل
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
function  CreateSearchFilter(){}