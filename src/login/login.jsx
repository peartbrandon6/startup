import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  function login(username, password) {
    localStorage.setItem('username', username);
    navigate('/fridge');
  }

  function createAccount(username, password) {
    localStorage.setItem('username', username);
    navigate('/fridge');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (event.nativeEvent.submitter?.value === 'create-account') {
      createAccount(username, password);
    } else {
      login(username, password);
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
            <button className="btn btn-outline-secondary" type="submit" value="create-account">
              Create an account
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}