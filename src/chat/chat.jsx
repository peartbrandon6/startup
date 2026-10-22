import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './chat.css';

const simulatedMessages = [
  { username: 'ALEX', text: 'Has anyone added milk to the fridge?' },
  { username: 'JAMIE', text: 'I just added some fresh vegetables.' },
  { username: 'TAYLOR', text: 'Remember to check the expiration dates!' },
];

export function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const messageListRef = useRef(null);
  const nextUserMessageId = useRef(0);

  useEffect(() => {
    let messageIndex = 0;
    const intervalId = window.setInterval(() => {
      const message = simulatedMessages[messageIndex % simulatedMessages.length];
      setMessages((currentMessages) => [
        ...currentMessages,
        { ...message, id: `simulated-${messageIndex}` },
      ]);
      messageIndex += 1;
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  function sendMessage(event) {
    event.preventDefault();
    const text = messageText.trim();
    if (!text) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${nextUserMessageId.current++}`, username: 'YOU', text },
    ]);
    setMessageText('');
  }

  return (
    <main id="chat" className="chat-layout">
      <section className="chat-room" aria-labelledby="chat-heading">
        <h2 id="chat-heading">FridgeMate Chat</h2>
        <p>Simulated chatroom messages will appear every 10 seconds.</p>

        <section
          className="chat-messages"
          ref={messageListRef}
          aria-label="Chatroom messages"
          aria-live="polite"
        >
          {messages.map((message) => (
            <article key={message.id}>
              <p>
                <strong>{message.username}:</strong> {message.text}
              </p>
            </article>
          ))}
        </section>

        <form onSubmit={sendMessage}>
          <p>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              cols="40"
              placeholder="Type a message"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              required
            />
          </p>
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
      </section>

      <section className="chat-image">
        <img
          src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80"
          alt="Chat bubbles on a screen"
        />
      </section>

      <nav className="site-nav" aria-label="Site links">
        <h2>Links</h2>
        <NavLink to="/fridge">Return to the fridge</NavLink>
      </nav>
    </main>
  );
}