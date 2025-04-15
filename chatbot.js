document.addEventListener("DOMContentLoaded", function() {
  // Создаем кнопку для открытия чата
  const chatToggleButton = document.createElement('button');
  chatToggleButton.id = 'chatbot-toggle';
  chatToggleButton.textContent = 'Чат';
  document.body.appendChild(chatToggleButton);

  // Создаем контейнер чат-бота
  const chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'chatbot-container';
  chatbotContainer.innerHTML = `
      <button id="exit-chat-btn">×</button>
      <div id="chat-log"></div>
      <div id="suggestions-wrapper">
          <button id="left-scroll-btn" class="scroll-btn">‹</button>
          <button id="right-scroll-btn" class="scroll-btn">›</button>
          <div id="suggestions-panel"></div>
      </div>
      <div id="chat-footer">
          <input id="user-input" type="text" placeholder="Введите вопрос..." />
          <button id="send-btn">➤</button>
      </div>
  `;
  document.body.appendChild(chatbotContainer);

  // Функции работы с cookie и генерация user_id
  function getCookie(name) {
      const value = "; " + document.cookie;
      const parts = value.split("; " + name + "=");
      if (parts.length === 2) return parts.pop().split(";").shift();
  }
  function setCookie(name, value, days) {
      let expires = "";
      if (days) {
          const date = new Date();
          date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  function generateUUID() {
      return 'xxxxxxxxyxxxxxyxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          return r.toString(16);
      });
  }

  // Проверяем наличие user_id, иначе генерируем новый
  let userId = getCookie("user_id");
  if (!userId) {
      userId = generateUUID();
      setCookie("user_id", userId, 365);
  }
  console.log("User ID:", userId);

  // Устанавливаем обработчик на кнопку открытия/закрытия чата
  chatToggleButton.addEventListener('click', () => {
      if (chatbotContainer.style.display === 'none' || chatbotContainer.style.display === '') {
          chatbotContainer.style.display = 'flex';
      } else {
          chatbotContainer.style.display = 'none';
      }
  });

  // Обработчик для кнопки выхода
  const exitChatBtn = chatbotContainer.querySelector('#exit-chat-btn');
  exitChatBtn.addEventListener('click', () => {
      chatbotContainer.style.display = 'none';
  });

  // Здесь можно добавить остальную логику чата (отправка сообщений и т.д.)
});