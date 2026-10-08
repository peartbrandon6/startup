import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Fridge } from './fridge/fridge';
import { Chat } from './chat/chat';

function NotFound() {
  return (
    <section className="container-fluid text-center">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="body bg-dark text-light" id="home">
        <header className="container-fluid">
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <NavLink className="navbar-brand" to="/">
              FridgeMate
            </NavLink>
            <menu className="navbar-nav flex-row gap-3">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/fridge">
                  Fridge
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/chat">
                  Chat
                </NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/fridge" element={<Fridge />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="bg-dark text-white-50">
          <div className="container-fluid">
            <p>
              Created by{' '}
              <a className="text-reset" href="https://github.com/peartbrandon6/startup">
                Brandon Peart
              </a>
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}