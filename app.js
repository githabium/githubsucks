const terminalOutput = document.getElementById("terminal-output");
const cursor = document.getElementById("cursor");
const terminalInput = document.getElementById("terminal-input");
let terminalText = ""; // Текущий текст терминала
const terminalOutput = document.getElementById("terminal-output");
const cursor = document.getElementById("cursor");
const wordCount = document.getElementById("word-count");
const socket = new WebSocket("ws://localhost:3001");
const terminalOutput = document.getElementById("terminal-output");
const wordCount = document.getElementById("word-count");
const terminalInput = document.getElementById("terminal-input");
const terminalFilePath = path.join(__dirname, "terminal.txt");
const socket = new WebSocket("wss://githubsucks-1.onrender.com");
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "text") {
        document.getElementById("terminal-output").textContent += data.data;
    }
};

wss.on("connection", (ws) => {
    console.log("Клиент подключился");

    // Отправляем текущий текст
    fs.readFile(terminalFilePath, "utf8", (err, data) => {
        if (!err) {
            ws.send(JSON.stringify({ type: "text", content: data }));
        }
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "input") {
            fs.appendFile(terminalFilePath, parsedMessage.content, (err) => {
                if (!err) {
                    console.log("Сохранён текст:", parsedMessage.content);

                    // Рассылка другим клиентам
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: "text", content: parsedMessage.content }));
                        }
                    });
                }
            });
        }
    });
});

terminalInput.addEventListener("input", () => {
    const content = terminalInput.value;
    socket.send(JSON.stringify({ type: "input", content }));
    terminalInput.value = ""; // Очищаем поле ввода
});

function updateWordCount() {
    const words = terminalOutput.textContent.split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = words.length;
}

// Обновляем счётчик слов при каждом изменении
socket.onmessage = (event) => {
    const data = event.data;
    terminalOutput.textContent += data;
    updateWordCount(); // Подсчитываем слова
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "text") {
        let charIndex = 0;

        function typeCharacter() {
            if (charIndex < data.content.length) {
                const char = data.content[charIndex];
                terminalOutput.textContent += char;
                if (char === " " || char === "\n") {
                    const words = terminalOutput.textContent.split(/\s+/);
                    wordCount.textContent = words.filter(word => word.length > 0).length;
                }
                charIndex++;
                setTimeout(typeCharacter, 30); // Скорость печати
            }
        }
        typeCharacter();
    }
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "text") {
        let charIndex = 0;

        function typeCharacter() {
            if (charIndex < data.content.length) {
                const char = data.content[charIndex];
                if (char === "\b") { // Удаление символа
                    terminalOutput.textContent = terminalOutput.textContent.slice(0, -1);
                } else {
                    terminalOutput.textContent += char;
                }
                charIndex++;
                setTimeout(typeCharacter, 30); // Эффект печатной машинки
            }
        }
        typeCharacter();
    }
};

// Ввод текста в реальном времени
const terminalInput = document.getElementById("terminal-input");
terminalInput.addEventListener("input", () => {
    const content = terminalInput.value;
    socket.send(JSON.stringify({ type: "input", content }));
});

const socket = new WebSocket("ws://localhost:3001");

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "text") {
        const content = data.data;
        terminalOutput.textContent += content;
        terminalOutput.scrollTop = terminalOutput.scrollHeight; // Автоскролл
    }
};

terminalInput.addEventListener("input", () => {
    const content = terminalInput.value;
    socket.send(JSON.stringify({ type: "input", content }));
    terminalInput.value = ""; // Очищаем поле ввода
});