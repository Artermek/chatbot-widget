import {
  getCookie,
  isValidPhone,
  SELECTORS,
  MESSAGES,
  ASSISTANT_AVATAR_URL,
  MAX_HISTORY_SIZE,
} from "../shared/utils.js";
import {
  sendMessage as sendByMessage,
  sendTrialRequest,
} from "./../api/messageService.js";

const chatbotContainer = document.getElementById(SELECTORS.CHATBOT_CONTAINER);
const chatLog = document.getElementById(SELECTORS.CHAT_LOG);
const suggestionsPanel = document.getElementById(SELECTORS.SUGGESTIONS_PANEL);
const userInput = document.getElementById(SELECTORS.USER_INPUT);
const leftScrollBtn = document.getElementById(SELECTORS.LEFT_SCROLL_BTN);
const rightScrollBtn = document.getElementById(SELECTORS.RIGHT_SCROLL_BTN);
const chatToggleButton = document.getElementById(SELECTORS.CHAT_TOGGLE_BUTTON);
let chatHistory = [];

export function initializeChat(userId) {
  const chatHistoryKey = `chatHistory_${userId}`;
  if (!document.getElementById(SELECTORS.POLICY_HEADER)) {
    appendPolicyHeader();
  }
  loadChatHistory(chatHistoryKey);
}

function appendPolicyHeader() {
  const policyHtml = `
    <div id="${SELECTORS.POLICY_HEADER}">
      <p>
        При отправке данных вы соглашаетесь с 
        <a href="https://siriusfuture.ru/legal/politika" target="_blank">политикой обработки персональных данных</a>
      </p>
    </div>`;
  chatLog.insertAdjacentHTML("beforeend", policyHtml);
}

export function displayMessage(role, text, suggestions = []) {
  const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fragment = document.createDocumentFragment();
  if (role === "user") {
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = safeText;
    fragment.appendChild(userMessage);
  } else if (role === "bot") {
    const botMessage = document.createElement("div");
    botMessage.className = "bot-message";
    botMessage.innerHTML = `
      <img src="${ASSISTANT_AVATAR_URL}" class="assistant-avatar" alt="Chat Assistant">
      <div class="bot-text">${safeText}</div>`;
    fragment.appendChild(botMessage);

    suggestionsPanel.innerHTML = "";
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        const button = document.createElement("button");
        button.className = "suggestion-button";
        button.textContent = suggestion;
        button.addEventListener("click", () => sendMessageByText(suggestion));
        suggestionsPanel.appendChild(button);
      });
    }
  }
  chatLog.appendChild(fragment);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function appendLogic(role, text, suggestions = []) {
  chatHistory.push({ role, content: text, suggestions });
  if (chatHistory.length > MAX_HISTORY_SIZE) {
    chatHistory.shift();
  }
  saveChatHistory();

  displayMessage(role, text, suggestions);
}

export function appendMessage(role, text, suggestions = [], type = "") {
  if (type === "greet" && !chatHistory.length) {
    appendLogic(role, text, suggestions);
    return;
  }
  if (type !== "greet") {
    appendLogic(role, text, suggestions);
    return;
  }
}

function saveChatHistory() {
  const userId = getCookie("user_id");
  const chatHistoryKey = `chatHistory_${userId}`;
  localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
}

function loadChatHistory(chatHistoryKey) {
  const storedHistory = localStorage.getItem(chatHistoryKey);
  if (storedHistory) {
    try {
      chatHistory = JSON.parse(storedHistory);
    } catch (e) {
      chatHistory = [];
      console.error("Ошибка парсинга истории чата:", e);
    }
    chatHistory.forEach((message) => {
      displayMessage(message.role, message.content, message.suggestions || []);
    });

    setTimeout(() => {
      if (chatbotContainer && chatbotContainer.style.display === "") {
        chatbotContainer.style.display = "flex";
        chatToggleButton.style.display = "none";
        try {
          const audio = new Audio(
            "https://cdn.jsdelivr.net/gh/Artermek/chatbot-widget/src/audio/open.mp3"
          );
          audio.volume = 0.2;
          audio.play().catch((error) => {
            console.error("Ошибка воспроизведения звука:", error);
          });
        } catch (error) {
          console.error("Ошибка создания аудио:", error);
        }
      }
    }, 12000);
  }
  chatLog.scrollTop = chatLog.scrollHeight;
}

export async function sendMessageByText(text, userIds) {
  let userId = userIds ?? getCookie("user_id");
  if (!text || !userId) return;

  appendMessage("user", text);
  userInput.value = "";

  userInput.disabled = true;
  try {
    const data = await sendByMessage({ userId, text });

    let suggestionsArray = [];
    if (data.button_answer) {
      const suggestionsText = data.button_answer.replace(/^\[|\]$/g, "");
      suggestionsArray = suggestionsText
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
    appendMessage("bot", data.message, suggestionsArray);
    if (data.show_form === true) {
      displayTrialForm(userId);
      leftScrollBtn.style.display = "none";
      rightScrollBtn.style.display = "none";
    }
    if (data.show_form === "False") {
      leftScrollBtn.style.display = "block";
      rightScrollBtn.style.display = "block";
    }
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    appendMessage("bot", MESSAGES.ERROR_NETWORK);
  } finally {
    userInput.disabled = false;
  }
}

export function displayTrialForm(userId) {
  const formHtml = `
    <form id="${SELECTORS.TRIAL_FORM}" class="trial-form">
      <div class="input-wrapper">
        <label class="form-label">Ваше имя</label>
        <input class="form-input" type="text" name="parentName" placeholder="Ваше имя" required>
      </div>
      <div class="input-wrapper">
        <label class="form-label">Номер телефона</label>
        <input class="form-input" type="text" name="phone" placeholder="+7..." required>
      </div>
      <div class="input-wrapper">
        <label class="form-label">Имя ребёнка</label>
        <input class="form-input" type="text" name="childName" placeholder="Имя ребёнка" required>
      </div>
      <div class="input-wrapper">
        <label class="form-label">Возраст ребёнка</label>
        <input class="form-input" name="childAge" placeholder="Возраст" required min="1" max="18">
      </div>
      <button class="form-submit-btn" type="submit">Отправить заявку</button>
    </form>`;
  const botFormHtml = `
    <div class="bot-message">
      <img src="${ASSISTANT_AVATAR_URL}" class="assistant-avatar" alt="Chat Assistant">
      ${formHtml}
    </div>`;
  chatLog.insertAdjacentHTML("beforeend", botFormHtml);
  chatLog.scrollTop = chatLog.scrollHeight;

  const formElement = document.getElementById(SELECTORS.TRIAL_FORM);
  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formElement);
    const parentName = formData.get("parentName");
    const phone = formData.get("phone");
    const childName = formData.get("childName");
    const childAge = formData.get("childAge");

    if (childAge < 1 || childAge > 18) {
      appendMessage("bot", "Возраст ребёнка должен быть от 1 до 18 лет.");
      return;
    }

    try {
      await sendTrialRequest({
        userId,
        parentName,
        phone,
        childName,
        childAge,
      });
      appendMessage("bot", MESSAGES.SUCCESS_FORM);
      formElement.remove();
    } catch (error) {
      console.error("Ошибка при отправке формы:", error);
      appendMessage("bot", MESSAGES.FALLBACK_FORM);
    }
  });
}
