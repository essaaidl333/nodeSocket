// استيراد Express
const express = require("express");
const app = express();

// تحديد المنفذ
const PORT = process.env.PORT || 3000;

// المسار الرئيسي
app.get("/", (req, res) => {
    res.send("مرحبا بك في تطبيق Node.js على Render!");
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
