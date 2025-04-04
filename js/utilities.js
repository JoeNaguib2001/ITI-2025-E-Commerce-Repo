//Bootstrap Toast Function
window.ShowBootstrapToast = function (message, type) {
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
};


function isSignedIn() {
    return (localStorage.getItem("isSignedIn") == "true") ? true : false;
}

function getSignedInUserName() {
    return localStorage.getItem("username") || null;
}

