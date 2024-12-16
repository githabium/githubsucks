const express = require("express");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const httpPort = 3000; // HTTP порт
const wsPort = 3001;  // WebSocket порт
const socket = new WebSocket("wss://githubsucks-1.onrender.com");


// Хостинг статики
app.use(express.static(path.join(__dirname, "public")));

// Логика разделения режима
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запуск HTTP-сервера
const server = app.listen(httpPort, () => {
    console.log(`HTTP сервер запущен: http://localhost:${httpPort}`);
});

// WebSocket сервер
const wss = new WebSocket.Server({ noServer: true });

// Подключение WebSocket
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

// Логика WebSocket
const terminalFilePath = path.join(__dirname, "terminal.txt");

wss.on("connection", (ws) => {
    console.log("Клиент подключился");

    // Отправка текущего содержимого terminal.txt
    fs.readFile(terminalFilePath, "utf8", (err, data) => {
        if (!err) {
            ws.send(JSON.stringify({ type: "text", data }));
        }
    });

    // Обработка входящих сообщений
    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "input") {
            const newText = parsedMessage.content;

            // Сохраняем текст в terminal.txt
            fs.appendFile(terminalFilePath, newText, (err) => {
                if (err) {
                    console.error("Ошибка записи в файл:", err);
                } else {
                    console.log("Добавлено:", newText);

                    // Рассылаем новый текст всем подключенным клиентам
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "text", data: newText }));
                        }
                    });
                }
            });
        }
    });

    // Логика при отключении клиента
    ws.on("close", () => {
        console.log("Клиент отключился");
    });
});