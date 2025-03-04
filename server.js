// استيراد المكتبات اللازمة
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// إنشاء تطبيق Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// تحديد المنفذ
const PORT = process.env.PORT || 3000;

// المسار الرئيسي
app.get("/", (req, res) => {
    res.send("مرحبا بك في تطبيق WebSocket على Render!");
});

// التعامل مع اتصالات WebSocket
wss.on("connection", (ws) => {
    console.log("عميل متصل");
    
    ws.on("message", (message) => {
        console.log(`تم استقبال رسالة: ${message}`);
        ws.send(`تم استلام رسالتك: ${message}`);
    });

    ws.on("close", () => {
        console.log("تم قطع الاتصال");
    });
});

// تشغيل السيرفر
server.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
