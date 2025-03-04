// استيراد المكتبات اللازمة
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// إنشاء تطبيق Express
const app = express();
const server = http.createServer(app);
const io = new WebSocket.Server({ server });

// تحديد المنفذ
const PORT = process.env.PORT || 3000;

// المسار الرئيسي
app.get("/", (req, res) => {
    res.send("مرحبا بك في تطبيق WebSocket على Render!");
});

// التعامل مع اتصالات WebSocket
// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);
  
//     // تسجيل اسم المستخدم عند الاتصال
//     socket.on("register", (username) => {
//       socket.username = username;
//       users.set(username, socket.id); // تخزين الاسم و socket.id
//       console.log(`User registered: ${username} - ${socket.id}`);
//     });
  
//     // استقبال العرض وإرساله إلى مستخدم معين
//     socket.on("offer", ({ targetUser, offer }) => {
//       const targetSocketId = users.get(targetUser);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("offer", { offer, sender: socket.username });
//       } else {
//         console.error(`User ${targetUser} not found.`);
//       }
//     });
  
//     // استقبال الإجابة وإرسالها
//     socket.on("answer", ({ targetUser, answer }) => {
//       const targetSocketId = users.get(targetUser);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("answer", answer);
//       } else {
//         console.error(`User ${targetUser} not found.`);
//       }
//     });
  
//     // استقبال مرشح ICE وإرساله
//     socket.on("ice-candidate", ({ targetUser, candidate }) => {
//       const targetSocketId = users.get(targetUser);
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("ice-candidate", candidate);
//       } else {
//         console.error(`User ${targetUser} not found.`);
//       }
//     });
  
//     // إرسال بيانات عامة (مثل الرسائل النصية)
//     socket.on("send", (data) => {
//       socket.broadcast.emit("send", data); // إرسال البيانات للجميع باستثناء المرسل
//     });
  
//     // التعامل مع فصل الاتصال
//     socket.on("disconnect", () => {
//       // حذف المستخدم من الخريطة عند قطع الاتصال
//       for (let [username, id] of users.entries()) {
//         if (id === socket.id) {
//           users.delete(username);
//           console.log(`User ${username} disconnected`);
//           break;
//         }
//       }
//     });
//   });
// const users = new Map();
     io.on("connection", (socket) => {
      console.log("User connected:", socket.id);
    
      // تسجيل اسم المستخدم عند الاتصال
      socket.on("register", (username) => {
        socket.username = username;
        users.set(username, socket.id); // تخزين الاسم و socket.id
        console.log(`User registered: ${username} - ${socket.id}`);
      });
    
      // استقبال طلب الاتصال وإرساله إلى المستخدم الهدف
      socket.on("call-user", ({ targetUser, offer, username_get }) => {
        const targetSocketId = users.get(targetUser);
        const mySocketId = users.get(username_get);
        if (targetSocketId) {
          console.log(`Sending offer to ${targetUser} (${targetSocketId})`);
          io.to(targetSocketId).emit("incoming-call", { offer, caller: socket.username });
        } else {
          // console.error(`User ${username_get} not found.`);
          io.to(mySocketId).emit("not-found",{targetUser});
        }
      });
    
      // استقبال رد المستخدم الهدف (قبول أو رفض)
      socket.on("call-response", ({ caller, response, answer }) => {
        const callerSocketId = users.get(caller);
        if (callerSocketId) {
          if (response === "accepted") {
            console.log(`Call accepted by ${caller}, sending answer to ${callerSocketId}`);
            io.to(callerSocketId).emit("call-accepted", { answer });
          } else {
            console.log(`Call rejected by ${caller}`);
            io.to(callerSocketId).emit("call-rejected");
          }
        } else {
          console.error(`User ${caller} not found.`);
        }
      });
    
      // استقبال مرشح ICE وإرساله
      socket.on("ice-candidate", ({ targetUser, candidate }) => {
        const targetSocketId = users.get(targetUser);
        if (targetSocketId) {
          io.to(targetSocketId).emit("ice-candidate", candidate);
        } else {
          console.error(`User ${targetUser} not found.`);
        }
      });
    
      //استقبال انهاء المكالمة 
      socket.on("end-call", ({ targetUser }) => {
        const targetSocketId = users.get(targetUser);
        // const mySocketId = users.get(username_get);
        if (targetSocketId) {
          console.log(`Sending offer to ${targetUser} (${targetSocketId})`);
          io.to(targetSocketId).emit("end-call");
        } else {
          console.error(`User ${targetUser}  not found.`);
          
        }
      });
    
      // التعامل مع فصل الاتصال
      socket.on("disconnect", () => {
        // حذف المستخدم من الخريطة عند قطع الاتصال
        for (let [username, id] of users.entries()) {
          if (id === socket.id) {
            users.delete(username);
            console.log(`User ${username} disconnected`);
            break;
          }
        }
      });
    });
// تشغيل السيرفر
server.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
