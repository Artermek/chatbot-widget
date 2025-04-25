class MessageService {
  constructor() {
    if (MessageService.instance) {
      return MessageService.instance;
    }
    MessageService.instance = this;
    this.BASE_URL = "https://ai-sirius-test-3cca67054617.herokuapp.com";
  }

  async _makeRequest(url, body) {
    try {
      const response = await fetch(`${this.BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Request to ${url} failed:`, error);
      throw error;
    }
  }

  async sendMessage({ userId, text }) {
    return this._makeRequest("/api/get_answer_async", {
      user_id: userId,
      text,
    });
  }

  async sendTrialRequest({ userId, parentName, phone, childName, childAge }) {
    return this._makeRequest("/trial-lesson", {
      user_id: userId,
      parentName,
      phone,
      childName,
      childAge,
    });
  }
}

const messageServiceInstance = new MessageService();
Object.freeze(messageServiceInstance);

export const sendMessage = messageServiceInstance.sendMessage.bind(
  messageServiceInstance
);
export const sendTrialRequest = messageServiceInstance.sendTrialRequest.bind(
  messageServiceInstance
);
