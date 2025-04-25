export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

export function generateUUID() {
  return crypto.randomUUID();
}

export const SELECTORS = {
  CHAT_TOGGLE_BUTTON: "chatbot-toggle",
  EXIT_CHAT_BTN: "exit-chat-btn",
  CHATBOT_CONTAINER: "chatbot-container",
  CHAT_LOG: "chat-log",
  SUGGESTIONS_PANEL: "suggestions-panel",
  USER_INPUT: "user-input",
  LEFT_SCROLL_BTN: "left-scroll-btn",
  RIGHT_SCROLL_BTN: "right-scroll-btn",
  POLICY_HEADER: "policy-header",
  TRIAL_FORM: "trialForm",
  SEND_BUTTON: "send-btn",
};

export const MESSAGES = {
  ERROR_NETWORK: "Произошла ошибка. Пожалуйста, попробуйте позже.",
  ERROR_FORM: "Ошибка при отправке формы. Попробуйте снова.",
  SUCCESS_FORM: "Спасибо! Ваша заявка принята, мы скоро свяжемся с вами.",
  FALLBACK_FORM:
    "Ваша заявка получена, в ближайшее время с вами свяжется менеджер.\nЕсли у вас остались вопросы, спрашивайте!",
};

export const MAX_HISTORY_SIZE = 100;
export const ASSISTANT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdIIG48LGHqSQAQ2wXoOaYitN-bbaaV7COKQ&s";

export function isValidPhone(phone) {
  return /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(phone);
}
