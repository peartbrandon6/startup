import React from 'react';
import { NavLink } from 'react-router-dom';

export function Login() {
  return (
    <main id="login" className="container-fluid text-center">
      <section aria-labelledby="login-heading">
        <h2 id="login-heading">Log in</h2>

        <form>
          <p>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" type="text" placeholder="Enter your username" required />
          </p>

          <p>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" required />
          </p>

          <p>
            <NavLink className="btn btn-primary" to="/fridge">
              Log in
            </NavLink>
          </p>
        </form>

        <p>
          <NavLink className="btn btn-outline-secondary" to="/fridge">
            Create an account(move to the fridge page)
          </NavLink>
        </p>
      </section>
    </main>
  );
}