import {
  initializeChat,
  appendMessage,
} from "https://cdn.jsdelivr.net/gh/Artermek/chatbot-widget/src/features/chat.js";
import { setupEventListeners } from "https://cdn.jsdelivr.net/gh/Artermek/chatbot-widget/src/features/dom.js";
import {
  getCookie,
  setCookie,
  generateUUID,
} from "https://cdn.jsdelivr.net/gh/Artermek/chatbot-widget/src/shared/utils.js";
let userId = getCookie("user_id");
if (!userId) {
  userId = generateUUID();
  setCookie("user_id", userId, 365);
}

initializeChat(userId);

const greetingButtons = [
  "Запишите на вводное занятие",
  "Расскажите о стоимости",
  "У меня другой вопрос",
];
appendMessage(
  "bot",
  "Рады приветствовать вас в Sirius Future! Хотите что-то уточнить?",
  greetingButtons,
  "greet"
);

setupEventListeners(userId);
