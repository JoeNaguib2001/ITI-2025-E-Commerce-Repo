const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// تحديد مسار ملف الحسابات
const accountsFilePath = path.join(__dirname, "../Data/Accounts.json");


app.use(express.json()); // للسماح بقراءة بيانات JSON من الطلبات
app.use(cors());


// التحقق من اسم المستخدم وحفظ الحساب الجديد
app.post("/signup", (req, res) => {
    const { fullName, userName, password, email, userType } = req.body;

    // قراءة بيانات الحسابات الحالية
    fs.readFile(accountsFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "❌ خطأ في قراءة البيانات" });
        }

        let accounts = [];
        if (data) {
            accounts = JSON.parse(data);
        }

        // التحقق من أن اسم المستخدم غير مكرر
        const existingUser = accounts.find(acc => acc.userName === userName);
        if (existingUser) {
            return res.status(400).json({ message: "🙄 الاسم محجوز، حاول تاني باسم مختلف!" });
        }

        // إضافة الحساب الجديد
        const newUser = { fullName, userName, password, email, userType };
        accounts.push(newUser);
        console.log("✅ تم إضافة حساب جديد:", newUser);
        // حفظ البيانات في ملف Accounts.json
        fs.writeFile(accountsFilePath, JSON.stringify(accounts, null, 2), (err) => {
            if (err) {
                console.log("❌ خطأ في حفظ البيانات");
                return res.status(500).json({ message: "❌ خطأ في حفظ البيانات" });
            }
            res.status(201).json({ message: "✅ تم التسجيل بنجاح!" });
        });
    });
});


const ordersFilePath = path.join(__dirname, "../Data/Orders.json");

app.post("/checkout", (req, res) => {
    const orderData = {
        orderId: req.body.orderId,
        userName: req.body.userName,
        orderDate: req.body.orderDate,
        estimatedDelivery: req.body.estimatedDelivery,
        order: req.body.order
    };

    fs.readFile(ordersFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "❌ خطأ في قراءة البيانات" });
        }

        let orders = [];
        if (data) {
            orders = JSON.parse(data);
        }

        orders.push(orderData); // إضافة الطلب الجديد

        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "❌ خطأ في حفظ الطلب" });
            }
            res.status(201).json({ message: "✅ تم إتمام الطلب بنجاح!" });
        });
    });
});



// تشغيل السيرفر
app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:3000`);
});
