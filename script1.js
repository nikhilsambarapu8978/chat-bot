const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector("#send-btn");
const copyBtn = document.querySelector("#copy-btn");
const regenerateBtn = document.querySelector("#regenerate-btn");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

const API_KEY = "AIzaSyCNCa2K0vhJshlOwvs9dy0OFR54qhN0Mic";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  const chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
};

const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: userMessage }]
      }]
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    messageElement.textContent = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);
  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);

closeBtn.addEventListener("click", () => document.querySelector(".chatbot").style.display = "none");

copyBtn.addEventListener("click", () => {
  const lastChat = document.querySelector(".chatbox .chat:last-child p");
  if (lastChat) {
    navigator.clipboard.writeText(lastChat.textContent)
      .then(() => alert("Message copied to clipboard"))
      .catch(err => console.error("Could not copy text: ", err));
  }
});

regenerateBtn.addEventListener("click", () => {
  const lastOutgoing = document.querySelector(".chatbox .outgoing p").textContent;
  if (lastOutgoing) {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    userMessage = lastOutgoing;
    generateResponse(incomingChatLi);
  }
});




