const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid"); // استيراد مكتبة uuid

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("مرحبا بك في تطبيق WebSocket على Render!");
});

const users = new Map();

wss.on("connection", (socket) => {
    const connectionId = uuidv4(); // إنشاء معرف فريد
    console.log("User connected:", connectionId);

    // تعيين المعرف للـ socket
    socket.id = connectionId;

    // تسجيل اسم المستخدم عند الاتصال
    socket.on("register", (username) => {
        socket.username = username;
        users.set(username, socket);
        console.log(`User registered: ${username} - ${socket.id}`);
    });

    // استقبال طلب الاتصال وإرساله إلى المستخدم الهدف
    socket.on("call-user", (data) => {
        const { targetUser, offer, username_get } = JSON.parse(data);
        const targetSocket = users.get(targetUser);
        const mySocket = users.get(username_get);

        if (targetSocket) {
            console.log(`Sending offer to ${targetUser}`);
            targetSocket.send(JSON.stringify({ type: "incoming-call", offer, caller: socket.username }));
        } else {
            console.error(`User ${targetUser} not found.`);
            if (mySocket) {
                mySocket.send(JSON.stringify({ type: "not-found", targetUser }));
            }
        }
    });

    // استقبال رد المستخدم الهدف (قبول أو رفض)
    socket.on("call-response", (data) => {
        const { caller, response, answer } = JSON.parse(data);
        const callerSocket = users.get(caller);

        if (callerSocket) {
            if (response === "accepted") {
                console.log(`Call accepted by ${caller}, sending answer to ${caller}`);
                callerSocket.send(JSON.stringify({ type: "call-accepted", answer }));
            } else {
                console.log(`Call rejected by ${caller}`);
                callerSocket.send(JSON.stringify({ type: "call-rejected" }));
            }
        } else {
            console.error(`User ${caller} not found.`);
        }
    });

    // استقبال مرشح ICE وإرساله
    socket.on("ice-candidate", (data) => {
        const { targetUser, candidate } = JSON.parse(data);
        const targetSocket = users.get(targetUser);

        if (targetSocket) {
            targetSocket.send(JSON.stringify({ type: "ice-candidate", candidate }));
        } else {
            console.error(`User ${targetUser} not found.`);
        }
    });

    // استقبال انهاء المكالمة
    socket.on("end-call", (data) => {
        const { targetUser } = JSON.parse(data);
        const targetSocket = users.get(targetUser);

        if (targetSocket) {
            console.log(`Sending end-call to ${targetUser}`);
            targetSocket.send(JSON.stringify({ type: "end-call" }));
        } else {
            console.error(`User ${targetUser} not found.`);
        }
    });

    // التعامل مع فصل الاتصال
    socket.on("close", () => {
        for (let [username, userSocket] of users.entries()) {
            if (userSocket === socket) {
                users.delete(username);
                console.log(`User ${username} disconnected`);
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});