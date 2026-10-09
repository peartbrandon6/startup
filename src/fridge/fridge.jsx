import React from 'react';
import { NavLink } from 'react-router-dom';
import './fridge.css';

export function Fridge() {
  return (
    <main id="fridge">
      <p className="page-intro">
        Add all your fridge items and their expiration dates here. We'll keep track of them and let you know when they
        will expire. If you use all of something, you can remove it from your fridge.
      </p>
      <section className="fridge-panel" aria-labelledby="fridge-data-heading">
        <h2 className="panel-heading" id="fridge-data-heading">
          Fridge Items
        </h2>

        <div className="item-forms">
          <form>
            <h3>Add an item</h3>
            <p>
              <label htmlFor="item-name">Item name</label>
              <input id="item-name" name="item-name" type="text" placeholder="Enter an item" required />
            </p>
            <p>
              <label htmlFor="days-until-expiration">Days until expiration</label>
              <input
                id="days-until-expiration"
                name="days-until-expiration"
                type="number"
                min="0"
                placeholder="Enter number of days"
                required
              />
            </p>
            <button className="btn btn-primary" type="submit">
              Add item
            </button>
          </form>

          <form>
            <h3>Remove an item</h3>
            <p>
              <label htmlFor="remove-item-name">Item name</label>
              <input
                id="remove-item-name"
                name="remove-name"
                type="text"
                placeholder="Enter an item"
                required
              />
            </p>
            <button className="btn btn-danger" type="submit">
              Remove item
            </button>
          </form>
        </div>

        <div className="sort-controls">
          <form>
            <button className="btn btn-outline-secondary" type="submit">
              Sort by expiration
            </button>
          </form>

          <form>
            <button className="btn btn-outline-secondary" type="submit">
              Sort by name
            </button>
          </form>
        </div>

        <div className="fridge-data">
          <table>
            <caption>Fridge data from the database</caption>
            <thead>
              <tr>
                <th scope="col">Item name</th>
                <th scope="col">Days until expiration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Database item placeholder</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
          <img
            src="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80"
            alt="A refrigerator in a kitchen"
          />
        </div>
      </section>

      <section className="nutrition-panel" aria-labelledby="nutrition-heading">
        <h2 className="panel-heading" id="nutrition-heading">
          Nutrition Information
        </h2>
        <p>Nutrition information from a third-party API will appear here.</p>
        <dl>
          <dt>Calories</dt>
          <dd>Nutrition data placeholder</dd>
          <dt>Protein</dt>
          <dd>Nutrition data placeholder</dd>
          <dt>Carbohydrates</dt>
          <dd>Nutrition data placeholder</dd>
        </dl>
      </section>

      <nav className="site-nav" aria-label="Site links">
        <h2>Links</h2>
        <NavLink to="/chat">Go to the chatroom</NavLink>
      </nav>
    </main>
  );
}