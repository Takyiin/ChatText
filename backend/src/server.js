const { WebSocketServer } = require("ws")
const dotenv = require("dotenv")

dotenv.config()

const PASSWORD = process.env.CHAT_PASSWORD || "123456"

const wss = new WebSocketServer({ port: process.env.PORT || 8080 })

wss.on("connection", (ws) => {
    ws.isAuthenticated = false

    ws.on("message", (data) => {
        let message

        try {
            message = JSON.parse(data.toString())
        } catch {
            return
        }

        // 🔐 AUTH
        if (message.type === "auth") {
            if (message.password === PASSWORD) {
                ws.isAuthenticated = true

                ws.send(JSON.stringify({
                    type: "auth",
                    status: "success"
                }))

                console.log("Cliente autenticado")
            } else {
                ws.send(JSON.stringify({
                    type: "auth",
                    status: "error"
                }))
                ws.close()
            }
            return
        }

        // ❌ bloqueia mensagens sem auth
        if (!ws.isAuthenticated) return

        // 📢 broadcast
        wss.clients.forEach((client) => {
            if (client.readyState === 1 && client.isAuthenticated) {
                client.send(data.toString())
            }
        })
    })

    ws.on("close", () => {
        console.log("Cliente desconectado")
    })

    console.log("Cliente conectado")
})
