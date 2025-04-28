import { sendMessageByText } from "./chat.js";
import { SELECTORS } from "../shared/utils.js";
export function setupEventListeners(userId) {
  const chatToggleButton = document.getElementById(
    SELECTORS.CHAT_TOGGLE_BUTTON
  );
  const chatbotContainer = document.getElementById(SELECTORS.CHATBOT_CONTAINER);
  const exitChatBtn = document.getElementById(SELECTORS.EXIT_CHAT_BTN);
  const leftScrollBtn = document.getElementById(SELECTORS.LEFT_SCROLL_BTN);
  const rightScrollBtn = document.getElementById(SELECTORS.RIGHT_SCROLL_BTN);
  const sendBtn = document.getElementById(SELECTORS.SEND_BUTTON);
  const userInput = document.getElementById(SELECTORS.USER_INPUT);

  chatToggleButton.addEventListener("click", () => {
    chatbotContainer.style.display =
      chatbotContainer.style.display === "flex" ? "none" : "flex";
    chatToggleButton.style.display = "none";
  });

  exitChatBtn.addEventListener("click", () => {
    chatToggleButton.style.display = "flex";
    chatbotContainer.style.display = "none";
  });

  leftScrollBtn.addEventListener("click", () => {
    document.getElementById("suggestions-panel").scrollLeft -= 150;
  });

  rightScrollBtn.addEventListener("click", () => {
    document.getElementById("suggestions-panel").scrollLeft += 150;
  });

  sendBtn.addEventListener("click", () =>
    sendMessageByText(userInput.value.trim(), userId)
  );

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessageByText(userInput.value.trim(), userId);
    }
  });
}
