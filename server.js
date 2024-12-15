const express = require("express");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");

const app = express(); // Создаем приложение Express
const httpPort = 3000; // HTTP порт
const wsPort = 3001; // WebSocket порт
const express = require("express");
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const port = 3001;

// Хостинг статики
app.use(express.static(path.join(__dirname, "public")));

// WebSocket сервер
const wss = new WebSocket.Server({ noServer: true });

// Логика разделения режима
app.get("/%terminal%sourceopen%source%advancedai%9901%%qwblqgo161", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "%terminal%sourceopen%source%advancedai%9901%%qwblqgo161.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
});

// WebSocket подключение
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

// Логика WebSocket
wss.on("connection", (ws, req) => {
    console.log("Клиент подключился");

    // Логика обработки сообщений
    ws.on("message", (message) => {
        console.log("Сообщение от клиента:", message);
        // Рассылка другим клиентам
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});



// Раздача статических файлов из папки "public"
app.use(express.static(path.join(__dirname, "public")));

// Запуск HTTP-сервера
app.listen(httpPort, () => {
    console.log(`HTTP сервер запущен: http://localhost:${httpPort}`);
});

// WebSocket сервер
const wss = new WebSocket.Server({ port: wsPort });

console.log(`WebSocket сервер запущен на порту ${wsPort}`);

const terminalFilePath = path.join(__dirname, "terminal.txt");

// Обработка WebSocket соединений
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