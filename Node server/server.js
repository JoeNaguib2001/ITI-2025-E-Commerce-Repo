const fs = require("fs");
// const fsp = require("fs/promises");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// تحديد مسار ملف الحسابات
const accountsFilePath = path.join(__dirname, "../Data/Accounts.json");
const ORDERS_FILE = path.join(__dirname, 'orders.json');



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
    try {
        debugger;
        // Sent Data From Front
        const orderData = {
            orderId: req.body.orderId,
            userName: req.body.userName,
            orderDate: req.body.orderDate,
            estimatedDelivery: req.body.estimatedDelivery,
            order: req.body.order,
            orderStatus: req.body.orderStatus,
            totalPrice: req.body.totalPrice,
            paymentMethod: req.body.paymentMethod,
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
    }

    catch {
        throw new Error("❌ خطأ في معالجة الطلب");
    }


});



app.put('/ChangeStatus', (req, res) => {
    console.log("بطييييخ");

    const orderId = parseInt(req.body.orderId);
    const status = req.body.orderStatus;

    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'رقم الطلب غير صحيح' });
    }
    if (!status) {
        return res.status(400).json({ error: 'الحالة مطلوبة' });
    }

    // ✅ اقرأ الملف بطريقة async (callback)
    fs.readFile(ordersFilePath, 'utf8', (readErr, data) => {
        if (readErr) {
            console.error(readErr);
            return res.status(500).json({ error: 'فشل في قراءة الطلبات' });
        }

        let orders;
        try {
            orders = JSON.parse(data);
        } catch (parseErr) {
            console.error(parseErr);
            return res.status(500).json({ error: 'فشل في تحليل البيانات' });
        }

        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        orders[orderIndex].orderStatus = status;

        // ✅ اكتب الملف بشكل async (callback)
        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).json({ error: 'فشل في حفظ التعديلات' });
            }

            res.json({
                message: 'تم تحديث الحالة بنجاح',
                order: orders[orderIndex]
            });
        });
    });
});
// تشغيل السيرفر
app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:3000`);
});
