// ================= LOGIN ELEMENTS =================
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")

// ================= CHAT ELEMENTS =================
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")

// ================= EMOJI ELEMENTS =================
const emojiButton = document.querySelector(".emoji__button")
const emojiPanel = document.querySelector(".emoji__panel")

const emojis = [
    // 😀 Carinhas
    "😀","😁","😄","😃","😅","😂","🤣","😊","🙂","😉","😍","🥰",
    "😘","😗","😙","😚","😋","😛","😜","🤪","😝","🫠",
    "🤗","🤭","🤫","🤔","🫡","😐","😑","😶","🙄",
    "😏","😒","😬","😮","😲","🥱","😴","🤤",
    "😢","😭","😤","😠","😡","🤬","😱","😨","😰","😥",
    "🤯","😳","🥴","😵","😵‍💫",

    // ❤️ Emoções / Gestos
    "❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍",
    "💔","❤️‍🔥","❤️‍🩹","💖","💘","💝","💞","💕",
    "👍","👎","👏","🙌","🫶","🤝","👊","✊","🤞",
    "🙏","💪","🫵","👌","✌️","🤘","🤙","🖖",

    // 🎉 Diversão
    "🎉","🎊","🥳","🎈","🎂","🍰","🍕","🍔","🍟",
    "🍩","🍪","🍫","🍿","☕","🍺","🍻","🥂","🍷",

    // 🔥 Objetos / Extras
    "🔥","✨","⭐","🌟","💥","💯","⚡","💡","🎶","🎵",
    "📌","📎","📝","📷","🎮","🕹","💻","📱"
]


// ================= USER / WEBSOCKET =================
const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }
let websocket

// ================= EMOJI LOGIC =================
emojiPanel.innerHTML = ""

emojis.forEach(emoji => {
    const span = document.createElement("span")
    span.textContent = emoji

    span.addEventListener("click", () => {
        chatInput.value += emoji
        chatInput.focus()
        emojiPanel.style.display = "none"
    })

    emojiPanel.appendChild(span)
})

emojiButton.addEventListener("click", () => {
    emojiPanel.style.display =
        emojiPanel.style.display === "flex" ? "none" : "flex"
})

// Fecha painel ao enviar mensagem
chatForm.addEventListener("submit", () => {
    emojiPanel.style.display = "none"
})

// ================= MESSAGES =================
const createMessageSelfElement = (content) => {
    const div = document.createElement("div")
    div.classList.add("message--self")
    div.innerHTML = content
    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor
    span.innerHTML = sender

    div.appendChild(span)
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)

    const message =
        userId === user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)
    scrollScreen()
}

// ================= LOGIN =================
const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://chattext-jyog.onrender.com")
    websocket.onmessage = processMessage
}

// ================= SEND MESSAGE =================
const sendMessage = (event) => {
    event.preventDefault()

    if (!chatInput.value.trim()) return

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message))
    chatInput.value = ""
}

// ================= EVENTS =================
loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)
