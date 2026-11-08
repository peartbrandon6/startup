import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
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

function AppNavigation() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState(() => localStorage.getItem('username'));

  React.useEffect(() => {
    function updateUsername() {
      setUsername(localStorage.getItem('username'));
    }

    window.addEventListener('auth-change', updateUsername);
    window.addEventListener('storage', updateUsername);
    return () => {
      window.removeEventListener('auth-change', updateUsername);
      window.removeEventListener('storage', updateUsername);
    };
  }, []);

  function logout() {
    localStorage.removeItem('username');
    setUsername(null);
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand">
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
      {username && (
        <div className="account-controls">
          <span className="account-username">Signed in as {username}</span>
          <button className="btn btn-outline-secondary logout-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="body" id="home">
        <header className="container-fluid">
          <AppNavigation />
        </header>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/fridge" element={<Fridge />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer>
          <div className="container-fluid">
            <p>
              Created by{' '}
              <a href="https://github.com/peartbrandon6/startup">
                Brandon Peart
              </a>
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}