import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  async function authenticate(endpoint) {
    setError('');
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.msg || 'Unable to authenticate');
        return;
      }

      localStorage.setItem('username', result.username);
      navigate('/fridge');
    } catch {
      setError('Unable to reach the service. Please try again.');
    }
  }

  function login() {
    return authenticate('login');
  }

  function createAccount() {
    return authenticate('create');
  }

  function handleCreateAccount(event) {
    event.preventDefault();
    if (event.currentTarget.form.reportValidity()) {
      createAccount();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    login();
  }

  return (
    <main id="login" className="container-fluid text-center">
      <section aria-labelledby="login-heading">
        <h2 id="login-heading">Log in</h2>

        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </p>

          <p>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </p>

          {error && <p role="alert">{error}</p>}

          <p>
            <button className="btn btn-primary" type="submit" value="login">
              Log in
            </button>
          </p>
          <p>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleCreateAccount}
            >
              Create an account
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}