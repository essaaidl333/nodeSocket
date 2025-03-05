const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid"); // استيراد مكتبة uuid

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001; // تغيير المنفذ إلى 3001

// تخزين المستخدمين المتصلين
const users = new Map();

app.get("/", (req, res) => {
    res.send("مرحبا بك في تطبيق WebSocket على Render!");
});

// معالجة اتصالات WebSocket
wss.on("connection",  function connection(socket)  {
    // const connectionId = uuidv4(); // إنشاء معرف فريد
    // console.log("User connected:", socket);

    // تعيين المعرف للـ socket
    // socket.id = connectionId;

    // استقبال الرسائل من العميل
    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message); // تحويل الرسالة إلى JSON
            console.log("Received message:", data);

            switch (data.type) {
                case "register": // تسجيل المستخدم
                    const username = data.username_get;
                    if (username) {
                        socket.username = data.username_get;
                         users.set(username, socket);
                        console.log(`User registered: ${username} - ${socket.id}`);
                    }
                    break;

                case "call-user": // طلب الاتصال
                    const { targetUser, offer ,username_get} = data;
                    const use =data.username;
                    const targetSocket = users.get(targetUser);
                    const mySocket = users.get(use);
                    console.log(mySocket);
                    if (targetSocket) {
                        console.log(`Sending offer to ${targetUser}`);
                        targetSocket.send(JSON.stringify({ type: "incoming-call", offer, caller: socket.username }));
                    } else {
                        console.error(`User ${targetUser} not found.`);
                        if (mySocket) {
                            mySocket.send(JSON.stringify({ type: "not-found", targetUser }));
                        }
                    }
                    break;

                case "call-response": // رد على طلب الاتصال
                    const { caller, response, answer } = data;
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
                    break;

                case "ice-candidate": // إرسال مرشح ICE
                    const { targetUser: iceTargetUser, candidate } = data;
                    const iceTargetSocket = users.get(iceTargetUser);

                    if (iceTargetSocket) {
                        iceTargetSocket.send(JSON.stringify({ type: "ice-candidate", candidate }));
                    } else {
                        console.error(`User ${iceTargetUser} not found.`);
                    }
                    break;

                case "end-call": // إنهاء المكالمة
                    const { targetUser: endCallTargetUser } = data;
                    const endCallTargetSocket = users.get(endCallTargetUser);

                    if (endCallTargetSocket) {
                        console.log(`Sending end-call to ${endCallTargetUser}`);
                        endCallTargetSocket.send(JSON.stringify({ type: "end-call" }));
                    } else {
                        console.error(`User ${endCallTargetUser} not found.`);
                    }
                    break;

                default:
                    console.log("Unknown event type:", data.event);
            }
        } catch (error) {
            console.error("Error parsing message:", error);
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

// بدء تشغيل الخادم
server.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});