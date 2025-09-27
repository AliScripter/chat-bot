'use strict';

const chatInput = document.querySelector(`.chat-input textarea`);
const sendChatBtn = document.querySelector(`.chat-input span`);
const chatbox = document.querySelector(`.chatbox`);
const chatBotToggler = document.querySelector(`.chatbot-toggler`);
const chatbotCloseBtn = document.querySelector(`.close-btn`);

let userMessage;

//!---- To use the program, you must enter your own API key. For more information refer to :
// https://platform.openai.com/api-keys

const API_KEY =
  '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message & className

  const chatLi = document.createElement(`li`);
  chatLi.classList.add(`chat`, className);
  let chatContent =
    className === 'outgoing'
      ? `<p>$</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;

  chatLi.innerHTML = chatContent;
  chatLi.querySelector(`p`).textContent = message;
  return chatLi;
};

const generateResponse = incomingChatLi => {
  const messageElement = incomingChatLi.querySelector(`p`);

  const payload = {
    model: 'x-ai/grok-4-fast:free',
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: userMessage }],
      },
    ],
  };

  fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost/test',
      'X-Title': 'API Test Script',
    },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    // .then(data => {
    //   if (data.choices && data.choices.length > 0) {
    //     messageElement.textContent = data.choices[0].message.content;
    //   } else {
    //     messageElement.textContent = 'No response from assistant.';
    //   }
    // })
    .then(data => {
      if (data.choices && data.choices.length > 0) {
        const rawMessage = data.choices[0].message.content;

        // Markdown -> HTML
        const html = marked.parse(rawMessage);

        // بذارش توی DOM به جای textContent
        messageElement.innerHTML = html;

        // بعد از اینکه HTML گذاشتیم، highlight رو دوباره اجرا کن
        hljs.highlightAll();
      } else {
        messageElement.textContent = 'No response from assistant.';
      }
    })

    .catch(err => {
      messageElement.classList.add(`error`);
      messageElement.textContent = 'مشکلی پیش آمد. دوباره تلاش کنید.';
    })
    .finally(() => {
      chatbox.scrollTo(0, chatbox.scrollHeight);
    });
};

const handelChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = '';
  chatInput.style.height = `${inputInitHeight}px`;

  //   Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi(`Thiniking...`, 'incoming');
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener(`input`, () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener(`keydown`, e => {
  // If Enter key is pressed without Shift key and window width is greater than 800px , handel the chat

  if (e.key === 'Enter' && !e.shiftKey && window.innerHeight > 800) {
    e.preventDefault();
    handelChat();
  }
});

chatBotToggler.addEventListener(`click`, () =>
  document.body.classList.toggle(`show-chatbot`)
);

chatbotCloseBtn.addEventListener(`click`, () => {
  document.body.classList.remove(`show-chatbot`);
});

sendChatBtn.addEventListener(`click`, handelChat);
