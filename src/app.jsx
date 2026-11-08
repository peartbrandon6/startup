import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
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

function AuthenticatedPage({ children }) {
  const [status, setStatus] = React.useState('checking');

  React.useEffect(() => {
    const controller = new AbortController();
    async function checkAuthentication() {
      try {
        const response = await fetch('/api/auth/me', { signal: controller.signal });
        if (response.status === 401) {
          localStorage.removeItem('username');
          window.dispatchEvent(new Event('auth-change'));
          setStatus('anonymous');
          return;
        }
        if (!response.ok) {
          throw new Error('Could not verify your login.');
        }

        const result = await response.json();
        localStorage.setItem('username', result.username);
        window.dispatchEvent(new Event('auth-change'));
        setStatus('authenticated');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Could not verify authentication.', error);
          setStatus('error');
        }
      }
    }

    checkAuthentication();
    return () => controller.abort();
  }, []);

  if (status === 'anonymous') {
    return <Navigate to="/" replace />;
  }
  if (status === 'error') {
    return <p role="alert">Could not verify your login. Please try again.</p>;
  }
  if (status !== 'authenticated') {
    return <p role="status">Checking your login...</p>;
  }

  return children;
}

function AppNavigation() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState(() => localStorage.getItem('username'));
  const [logoutError, setLogoutError] = React.useState('');
  const [loggingOut, setLoggingOut] = React.useState(false);

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

  async function logout() {
    setLogoutError('');
    setLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('The service could not end your session.');
      }

      localStorage.removeItem('username');
      setUsername(null);
      navigate('/');
    } catch (error) {
      console.error('Could not log out from the service.', error);
      setLogoutError('Could not log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
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
          <button
            className="btn btn-outline-secondary logout-button"
            type="button"
            onClick={logout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
          {logoutError && <span role="alert">{logoutError}</span>}
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
          <Route
            path="/fridge"
            element={
              <AuthenticatedPage>
                <Fridge />
              </AuthenticatedPage>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthenticatedPage>
                <Chat />
              </AuthenticatedPage>
            }
          />
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