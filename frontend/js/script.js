// ================= LOGIN ELEMENTS =================
const login = document.querySelector(".login")
const loginForm = document.querySelector(".login__form")
const loginInput = document.querySelector(".login__input")
const passwordInput = document.querySelector(".login__password")

// ================= CHAT ELEMENTS =================
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = document.querySelector(".chat__input")
const chatMessages = document.querySelector(".chat__messages")

// ================= EMOJI ELEMENTS =================
const emojiButton = document.querySelector(".emoji__button")
const emojiPanel = document.querySelector(".emoji__panel")
const emojiList = document.querySelector(".emoji__list")
const categoryButtons = document.querySelectorAll(".emoji__categories button")

// ================= USER / WS =================
const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = {
    id: "",
    name: "",
    color: "",
    password: ""
}

let websocket

// ================= EMOJI CATEGORIES =================
const emojiCategories = {
    faces: [
        "😀","😁","😄","😂","🤣","😊","😍","🥰",
        "😎","🤔","😐","🙄","😢","😭","😡","🤬"
    ],
    gestures: [
        "❤️","🧡","💛","💚","💙","💜","🖤",
        "👍","👎","👏","🙌","🫶","🤝","🙏","💪"
    ],
    fun: [
        "🎉","🎊","🥳","🎈","🎂","🍕","🍔","🍟",
        "🍩","🍪","🍺","🍻","🎮","🎶"
    ],
    extras: [
        "🔥","✨","⭐","🌟","💥","⚡","💯",
        "📌","📎","📝","📷","💻","📱"
    ]
}

// ================= EMOJI LOGIC =================
const renderEmojis = (category) => {
    emojiList.innerHTML = ""

    emojiCategories[category].forEach(emoji => {
        const span = document.createElement("span")
        span.textContent = emoji

        span.addEventListener("click", () => {
            chatInput.value += emoji
            chatInput.focus()
            emojiPanel.style.display = "none"
        })

        emojiList.appendChild(span)
    })
}

renderEmojis("faces")
categoryButtons[0].classList.add("active")

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"))
        button.classList.add("active")
        renderEmojis(button.dataset.category)
    })
})

emojiButton.addEventListener("click", () => {
    emojiPanel.style.display =
        emojiPanel.style.display === "flex" ? "none" : "flex"
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

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const message = JSON.parse(data)

    if (message.type === "error") {
        alert(message.message)
        return
    }

    if (message.type === "chat") {
        const msg =
            message.userId === user.id
                ? createMessageSelfElement(message.content)
                : createMessageOtherElement(
                    message.content,
                    message.userName,
                    message.userColor
                )

        chatMessages.appendChild(msg)
        scrollScreen()
    }
}

// ================= LOGIN =================
const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.password = passwordInput.value
    user.color = colors[Math.floor(Math.random() * colors.length)]

    websocket = new WebSocket("wss://chattext-jyog.onrender.com")

    websocket.onopen = () => {
        websocket.send(JSON.stringify({
            type: "login",
            userName: user.name,
            password: user.password
        }))
    }

    websocket.onmessage = processMessage

    login.style.display = "none"
    chat.style.display = "flex"
}

// ================= SEND MESSAGE =================
const sendMessage = (event) => {
    event.preventDefault()

    if (!chatInput.value.trim()) return

    websocket.send(JSON.stringify({
        type: "chat",
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }))

    chatInput.value = ""
}

// ================= EVENTS =================
loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)
