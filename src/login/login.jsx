import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  function login() {
    localStorage.setItem('username', username);
    navigate('/fridge');
  }

  function createAccount() {
    localStorage.setItem('username', username);
    navigate('/fridge');
  }

  function handleSubmit(event) {
    event.preventDefault();
    login();
  }

  function handleCreateAccount(event) {
    if (event.currentTarget.form.reportValidity()) {
      createAccount();
    }
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