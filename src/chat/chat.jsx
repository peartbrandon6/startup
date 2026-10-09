import React from 'react';
import { NavLink } from 'react-router-dom';
import './chat.css';

export function Chat() {
  return (
    <main id="chat" className="chat-layout">
      <section className="chat-room" aria-labelledby="chat-heading">
        <h2 id="chat-heading">FridgeMate Chat</h2>
        <p>Chatroom messages from the WebSocket will appear here.</p>

        <article aria-label="Chatroom message placeholder">
          <p>
            <strong>USERNAME:</strong> Chat message placeholder
          </p>
        </article>

        <form>
          <p>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              cols="40"
              placeholder="Type a message"
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