const fs = require("fs"); // ده هيشتغل مع الكولباك
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.json());
app.use(cors());

// مسارات الملفات
const accountsFilePath = path.join(__dirname, "../Data/Accounts.json");
const ordersFilePath = path.join(__dirname, "../Data/Orders.json");

// إنشاء مجلد data إذا لم يكن موجودًا
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// تصحيح المسارات
const CATEGORIES_PATH = path.join(DATA_DIR, 'categories.json');
const PRODUCTS_PATH = path.join(DATA_DIR, 'products.json');
// تسجيل حساب جديد
app.post("/signup", (req, res) => {
    const { fullName, userName, password, email, userType } = req.body;

    fs.readFile(accountsFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "❌ خطأ في قراءة البيانات" });
        }

        let accounts = [];
        if (data) {
            accounts = JSON.parse(data);
        }

        const existingUser = accounts.find(acc => acc.userName === userName);
        if (existingUser) {
            return res.status(400).json({ message: "🙄 الاسم محجوز، حاول تاني باسم مختلف!" });
        }

        const newUser = { fullName, userName, password, email, userType };
        accounts.push(newUser);
        console.log("✅ تم إضافة حساب جديد:", newUser);

        fs.writeFile(accountsFilePath, JSON.stringify(accounts, null, 2), (err) => {
            if (err) {
                console.log("❌ خطأ في حفظ البيانات");
                return res.status(500).json({ message: "❌ خطأ في حفظ البيانات" });
            }
            res.status(201).json({ message: "✅ تم التسجيل بنجاح!" });
        });
    });
});

// إتمام الطلب
app.post("/checkout", (req, res) => {
    try {
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

            orders.push(orderData);

            fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: "❌ خطأ في حفظ الطلب" });
                }
                res.status(201).json({ message: "✅ تم إتمام الطلب بنجاح!" });
            });
        });
    } catch {
        throw new Error("❌ خطأ في معالجة الطلب");
    }
});

app.put('/ChangeStatus', async (req, res) => {
    console.log("BoODY:", req.body);


    try {
        const orderId = req.body.orderId;
        const status = req.body.orderStatus;

        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'رقم الطلب غير صحيح' });
        }
        if (!status) {
            return res.status(400).json({ error: 'الحالة مطلوبة' });
        }

        // استخدام async/await مع fs.promises.readFile
        const data = await fs.promises.readFile(ordersFilePath, 'utf8');
        const orders = JSON.parse(data);

        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        orders[orderIndex].orderStatus = status;

        // استخدام async/await مع fs.promises.writeFile
        await fs.promises.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));

        res.json({
            message: 'تم تحديث الحالة بنجاح',
            order: orders[orderIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

app.put('/update-product-status', async (req, res) => {
    console.log("BoODY:", req.body);

    try {
        const { orderId, productId, newStatus } = req.body;

        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'رقم الطلب غير صحيح' });
        }
        if (!productId || !newStatus) {
            return res.status(400).json({ error: 'رقم المنتج وحالة المنتج مطلوبة' });
        }

        // قراءة البيانات من ملف الطلبات
        const data = await fs.promises.readFile(ordersFilePath, 'utf8');
        const orders = JSON.parse(data);

        // العثور على الطلب باستخدام orderId
        const order = orders.find(o => o.orderId === orderId);
        if (!order) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        // العثور على المنتج داخل الطلب باستخدام productId
        const product = order.order.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ error: 'المنتج غير موجود في الطلب' });
        }

        // تحقق من وجود مفتاح ProductStatus
        if (!product.hasOwnProperty('ProductStatus')) {
            product.ProductStatus = "Pending"; // إضافة المفتاح وتعيين قيمته إلى "Pending"
        }

        // تحديث حالة المنتج إذا كان newStatus موجود
        product.ProductStatus = newStatus;

        // حفظ التغييرات في ملف الطلبات
        await fs.promises.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));

        // الرد على العميل بعد التحديث
        res.json({
            message: 'تم تحديث حالة المنتج بنجاح',
            order: order
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});
async function readJsonFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
  
  // مساعدة لكتابة الملفات
  async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
  
  // نقاط النهاية للمنتجات
  app.get('/api/products', async (req, res) => {
    try {
      const products = await readJsonFile(PRODUCTS_PATH);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب المنتجات' });
    }
  });
  
  app.get('/api/products/:id', async (req, res) => {
    try {
      const products = await readJsonFile(PRODUCTS_PATH);
      const product = products.find(p => p.id === parseInt(req.params.id));
      product ? res.json(product) : res.status(404).json({ error: 'المنتج غير موجود' });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب المنتج' });
    }
  });
  
  app.put('/api/products/:id', async (req, res) => {
    try {
      const products = await readJsonFile(PRODUCTS_PATH);
      const index = products.findIndex(p => p.id === parseInt(req.params.id));
      
      if (index === -1) {
        return res.status(404).json({ error: 'المنتج غير موجود' });
      }
      
      products[index] = { ...products[index], ...req.body };
      await writeJsonFile(PRODUCTS_PATH, products);
      res.json(products[index]);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في تحديث المنتج' });
    }
  });
  
  app.delete('/api/products/:id', async (req, res) => {
    try {
      let products = await readJsonFile(PRODUCTS_PATH);
      products = products.filter(p => p.id !== parseInt(req.params.id));
      await writeJsonFile(PRODUCTS_PATH, products);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'خطأ في حذف المنتج' });
    }
  });
  
  // نقاط النهاية للتصنيفات
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await readJsonFile(CATEGORIES_PATH);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب التصنيفات' });
    }
  });
  
  app.post('/api/categories', async (req, res) => {
    try {
      const categories = await readJsonFile(CATEGORIES_PATH);
      const newCategory = { 
        id: categories.length + 1, 
        ...req.body 
      };
      
      categories.push(newCategory);
      await writeJsonFile(CATEGORIES_PATH, categories);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في إنشاء تصنيف' });
    }
  });
// تشغيل السيرفر
app.listen(3000, () => {
    console.log(`🚀 Server running on http://localhost:3000`);
});
