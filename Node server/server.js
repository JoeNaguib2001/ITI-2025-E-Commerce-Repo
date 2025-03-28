const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// تحديد مسار ملف الحسابات
const accountsFilePath = path.join(__dirname, "../Accounts.json");

app.use(express.json()); // للسماح بقراءة بيانات JSON من الطلبات
app.use(cors());


// التحقق من اسم المستخدم وحفظ الحساب الجديد
app.post("/signup", (req, res) => {
    const { fullName, username, password, email } = req.body;

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
        const existingUser = accounts.find(acc => acc.username === username);
        if (existingUser) {
            return res.status(400).json({ message: "🙄 الاسم محجوز، حاول تاني باسم مختلف!" });
        }

        // إضافة الحساب الجديد
        const newUser = { fullName, username, password, email };
        accounts.push(newUser);

        // حفظ البيانات في ملف Accounts.json
        fs.writeFile(accountsFilePath, JSON.stringify(accounts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "❌ خطأ في حفظ البيانات" });
            }
            res.status(201).json({ message: "✅ تم التسجيل بنجاح!" });
        });
    });
});

// تشغيل السيرفر
app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:3000`);
});
