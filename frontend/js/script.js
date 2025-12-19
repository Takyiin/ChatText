// ================= LOGIN =================
const login = document.querySelector(".login")
const loginForm = document.querySelector(".login__form")
const loginInput = document.querySelector(".login__input")

// ================= CHAT =================
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = document.querySelector(".chat__input")
const chatMessages = document.querySelector(".chat__messages")

// ================= EMOJI =================
const emojiButton = document.querySelector(".emoji__button")
const emojiPanel = document.querySelector(".emoji__panel")
const emojiList = document.querySelector(".emoji__list")
const categoryButtons = document.querySelectorAll(".emoji__categories button")

const emojiCategories = {
    faces: ["😀","😁","😂","🤣","😊","😍","😎","🤔","😐","🙄","😢","😭","😡"],
    hearts: ["❤️","🧡","💛","💚","💙","💜","🖤","👍","👏","🙏","💪"],
    fun: ["🎉","🎊","🥳","🎂","🍕","🍔","🍟","🍺","🎮","🎶"],
    extras: ["🔥","✨","⭐","💯","⚡","📌","📎","📱","💻"]
}

const renderEmojis = (category) => {
    emojiList.innerHTML = ""
    emojiCategories[category].forEach(emoji => {
        const span = document.createElement("span")
        span.textContent = emoji
        span.onclick = () => {
            chatInput.value += emoji
            chatInput.focus()
            emojiPanel.style.display = "none"
        }
        emojiList.appendChild(span)
    })
}

// padrão
renderEmojis("faces")
categoryButtons[0].classList.add("active")

categoryButtons.forEach(btn => {
    btn.onclick = () => {
        categoryButtons.forEach(b => b.classList.remove("active"))
        btn.classList.add("active")
        renderEmojis(btn.dataset.category)
    }
})

emojiButton.onclick = () => {
    emojiPanel.style.display =
        emojiPanel.style.display === "flex" ? "none" : "flex"
}

// ================= CHAT LOGIC =================
const colors = ["cadetblue","darkgoldenrod","cornflowerblue","darkkhaki","hotpink","gold"]
const user = { id: "", name: "", color: "" }
let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")
    div.className = "message--self"
    div.innerHTML = content
    return div
}

const createMessageOtherElement = (content, sender, color) => {
    const div = document.createElement("div")
    div.className = "message--other"

    const span = document.createElement("span")
    span.className = "message--sender"
    span.style.color = color
    span.textContent = sender

    div.append(span)
    div.innerHTML += content
    return div
}

const processMessage = ({ data }) => {
    const msg = JSON.parse(data)
    const el = msg.userId === user.id
        ? createMessageSelfElement(msg.content)
        : createMessageOtherElement(msg.content, msg.userName, msg.userColor)

    chatMessages.appendChild(el)
    window.scrollTo({ top: document.body.scrollHeight })
}

// ================= LOGIN / SEND =================
loginForm.onsubmit = (e) => {
    e.preventDefault()
    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = colors[Math.floor(Math.random() * colors.length)]

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://chattext-jyog.onrender.com")
    websocket.onmessage = processMessage
}

chatForm.onsubmit = (e) => {
    e.preventDefault()
    if (!chatInput.value.trim()) return

    websocket.send(JSON.stringify({
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }))

    chatInput.value = ""
    emojiPanel.style.display = "none"
}
