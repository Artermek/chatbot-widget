
document.addEventListener("DOMContentLoaded", function() {
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
  
    // Инициализация переменных и поиск DOM-элементов
    const chatToggleButton = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
  
    // Проверьте, что элементы существуют
    if (!chatToggleButton) {
      console.error("Элемент с id 'chatbot-toggle' не найден.");
      return;
    }
    if (!chatbotContainer) {
      console.error("Элемент с id 'chatbot-container' не найден.");
      return;
    }
  
    // Устанавливаем обработчик на кнопку открытия/закрытия чата
    chatToggleButton.addEventListener('click', () => {
      if (chatbotContainer.style.display === 'none' || chatbotContainer.style.display === '') {
        chatbotContainer.style.display = 'flex';
      } else {
        chatbotContainer.style.display = 'none';
      }
    });
  
    // Остальной ваш код для работы чата...
    // Например, установка обработчика для кнопки выхода:
    const exitChatBtn = document.getElementById('exit-chat-btn');
    if (exitChatBtn) {
      exitChatBtn.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
      });
    }
  
    // Остальной код (логика чата, отправка сообщений и т.д.)
  });
  