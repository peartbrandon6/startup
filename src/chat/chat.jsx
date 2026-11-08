import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './chat.css';

export function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const messageListRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/chat`);
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      setConnected(true);
      setError('');
    });
    socket.addEventListener('message', (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.type === 'history' && Array.isArray(response.messages)) {
          setMessages(response.messages);
        } else if (response.type === 'message' && response.message) {
          setMessages((currentMessages) =>
            currentMessages.some((message) => message.id === response.message.id)
              ? currentMessages
              : [...currentMessages, response.message]
          );
        } else if (response.type === 'error') {
          setError(response.msg);
        }
      } catch (parseError) {
        console.error('Could not read a chat message from the service.', parseError);
        setError('Received an invalid response from the chat service.');
      }
    });
    socket.addEventListener('error', () => {
      setError('Could not connect to the chat service.');
    });
    socket.addEventListener('close', () => {
      setConnected(false);
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
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
    const socket = socketRef.current;
    if (!text || !socket || socket.readyState !== WebSocket.OPEN) {
      setError('The chat service is not connected. Please try again.');
      return;
    }

    const username = localStorage.getItem('username') || 'Guest';
    socket.send(JSON.stringify({ username, text }));
    setMessageText('');
    setError('');
  }

  return (
    <main id="chat" className="chat-layout">
      <section className="chat-room" aria-labelledby="chat-heading">
        <h2 id="chat-heading">FridgeMate Chat</h2>
        <p>{connected ? 'Connected to chat.' : 'Connecting to chat...'}</p>
        {error && <p role="alert">{error}</p>}

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
              maxLength={500}
              required
            />
          </p>
          <button className="btn btn-primary" type="submit" disabled={!connected}>
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