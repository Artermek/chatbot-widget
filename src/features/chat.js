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
let userIds = null;

export function initializeChat(userId) {
  leftScrollBtn.style.display = "none";
  const chatHistoryKey = `chatHistory_${userId}`;
  userIds = userId;
  if (!document.getElementById(SELECTORS.POLICY_HEADER)) {
    appendPolicyHeader();
  }

  loadChatHistory(chatHistoryKey);
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.attributeName === "style" ||
      mutation.attributeName === "class"
    ) {
      const isOpen = chatbotContainer.style.display !== "none";
      if (isOpen) {
        chatLog.scrollTo({
          top: chatLog.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  });
});

observer.observe(chatbotContainer, {
  attributes: true,
});

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
            "https://cdn.jsdelivr.net/gh/Artermek/c1hatbot-widget/src/audio/open.mp3"
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
  const botMessages = document.getElementsByClassName("bot-message");
  let userId = userIds ?? getCookie("user_id");
  if (!text || !userId) return;
  appendMessage("user", text);

  userInput.value = "";
  chatLog.scrollTo({
    top: chatLog.scrollHeight,
    behavior: "smooth",
  });
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
    chatLog.scrollTo({
      top:
        chatLog.scrollTop +
        botMessages[botMessages.length - 1].clientHeight / 2,
    });

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
  const existingForm = document.getElementById(SELECTORS.TRIAL_FORM);
  const existingBotMessageForm = document.getElementById("bot-message-form");
  if (existingForm) existingForm.remove();
  if (existingBotMessageForm) existingBotMessageForm.remove();

  const formHtml = `
    <div id="${SELECTORS.TRIAL_FORM}" class="trial-form">
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
        <input name="childAge" placeholder="Возраст" required min="1" max="18">
      </div>
      <button class="form-submit-btn" type="button">Отправить заявку</button>
    </div>`;
  const botFormHtml = `
    <div id="bot-message-form" class="bot-message">
      <img src="${ASSISTANT_AVATAR_URL}" class="assistant-avatar" alt="Chat Assistant">
      ${formHtml}
    </div>`;
  chatLog.insertAdjacentHTML("beforeend", botFormHtml);
  chatLog.scrollTop = chatLog.scrollHeight;

  const formElement = document.getElementById(SELECTORS.TRIAL_FORM);
  const botMessageForm = document.getElementById("bot-message-form");
  const submitButton = formElement.querySelector(".form-submit-btn");
  submitButton.addEventListener("click", async () => {
    try {
      const parentName = formElement.querySelector(
        'input[name="parentName"]'
      ).value;
      const phone = formElement.querySelector('input[name="phone"]').value;
      const childName = formElement.querySelector(
        'input[name="childName"]'
      ).value;
      const childAge = formElement.querySelector(
        'input[name="childAge"]'
      ).value;

      if (childAge < 1 || childAge > 18) {
        appendMessage("bot", "Возраст ребёнка должен быть от 1 до 18 лет.");
        return;
      }

      try {
        const response = sendTrialRequest({
          userId,
          parentName,
          phone,
          childName,
          childAge,
        });
        localStorage.setItem(
          "show_form",
          response.show_form === "False" ? false : true
        );
        appendMessage("bot", response.message1 || "Заявка успешно отправлена");
        appendMessage("bot", response.message || "Спасибо за ваш запрос!");
        if (formElement) formElement.remove();
        if (botMessageForm) botMessageForm.remove();
      } catch (error) {
        console.error("Ошибка при отправке формы:", error);
        appendMessage("bot", MESSAGES.FALLBACK_FORM);
      }
    } catch (error) {
      console.error("Общая ошибка при обработке формы:", error);
      appendMessage("bot", "Произошла ошибка при обработке формы.");
    }
  });
}
