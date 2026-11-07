import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './fridge.css';

let nextItemId = 0;

function createItemId() {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${nextItemId++}`;
}

function getNutritionData() {
  return [
    { nutrient: 'Calories', value: 'Nutrition data placeholder' },
    { nutrient: 'Protein', value: 'Nutrition data placeholder' },
    { nutrient: 'Carbohydrates', value: 'Nutrition data placeholder' },
  ];
}

export function Fridge() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [daysUntilExpiration, setDaysUntilExpiration] = useState('');
  const [removeItemName, setRemoveItemName] = useState('');
  const [sortType, setSortType] = useState('none');
  const [storageReady, setStorageReady] = useState(false);
  const [error, setError] = useState('');
  const nutritionData = getNutritionData();
  const displayedItems = [...items];

  if (sortType === 'name') {
    displayedItems.sort((first, second) => first.name.localeCompare(second.name));
  } else if (sortType === 'expiration') {
    displayedItems.sort(
      (first, second) => first.daysUntilExpiration - second.daysUntilExpiration
    );
  }

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch('/api/fridge/items');
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.msg || 'Could not load fridge items.');
        }
        if (
          !Array.isArray(result) ||
          !result.every(
            (item) =>
              item !== null &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.daysUntilExpiration === 'number'
          )
        ) {
          throw new Error('Fridge data is not in the expected format.');
        }

        setItems(result);
        setStorageReady(true);
      } catch (loadError) {
        console.error('Could not load fridge items from the service.', loadError);
        setError('Could not load fridge items. Check the service connection and try again.');
      }
    }

    loadItems();
  }, []);

  async function addItem(event) {
    event.preventDefault();
    const name = itemName.trim();
    if (!name || !storageReady) {
      return;
    }

    const item = {
      id: createItemId(),
      name,
      daysUntilExpiration: Number(daysUntilExpiration),
    };

    try {
      const response = await fetch('/api/fridge/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.msg || 'Could not add fridge item.');
        return;
      }

      setItems((currentItems) => [...currentItems, result]);
      setItemName('');
      setDaysUntilExpiration('');
      setError('');
    } catch (requestError) {
      console.error('Could not add fridge item through the service.', requestError);
      setError('Could not reach the service. The fridge item was not added.');
    }
  }

  async function removeItem(event) {
    event.preventDefault();
    const name = removeItemName.trim().toLowerCase();
    if (!name || !storageReady) {
      return;
    }

    const itemToRemove = items.find((item) => item.name.toLowerCase() === name);
    if (!itemToRemove) {
      setError(`No fridge item named "${removeItemName.trim()}" was found.`);
      return;
    }

    try {
      const response = await fetch(
        `/api/fridge/items/${encodeURIComponent(itemToRemove.id)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const result = await response.json();
        setError(result.msg || 'Could not remove fridge item.');
        return;
      }

      setItems((currentItems) => currentItems.filter((item) => item.id !== itemToRemove.id));
      setRemoveItemName('');
      setError('');
    } catch (requestError) {
      console.error('Could not remove fridge item through the service.', requestError);
      setError('Could not reach the service. The fridge item was not removed.');
    }
  }

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

        {error && <p role="alert">{error}</p>}

        <div className="item-forms">
          <form onSubmit={addItem}>
            <h3>Add an item</h3>
            <p>
              <label htmlFor="item-name">Item name</label>
              <input
                id="item-name"
                name="item-name"
                type="text"
                placeholder="Enter an item"
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                required
              />
            </p>
            <p>
              <label htmlFor="days-until-expiration">Days until expiration</label>
              <input
                id="days-until-expiration"
                name="days-until-expiration"
                type="number"
                min="0"
                placeholder="Enter number of days"
                value={daysUntilExpiration}
                onChange={(event) => setDaysUntilExpiration(event.target.value)}
                required
              />
            </p>
            <button className="btn btn-primary" type="submit" disabled={!storageReady}>
              Add item
            </button>
          </form>

          <form onSubmit={removeItem}>
            <h3>Remove an item</h3>
            <p>
              <label htmlFor="remove-item-name">Item name</label>
              <input
                id="remove-item-name"
                name="remove-name"
                type="text"
                placeholder="Enter an item"
                value={removeItemName}
                onChange={(event) => setRemoveItemName(event.target.value)}
                required
              />
            </p>
            <button className="btn btn-danger" type="submit" disabled={!storageReady}>
              Remove item
            </button>
          </form>
        </div>

        <div className="sort-controls">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setSortType('expiration')}
            disabled={!storageReady}
          >
            Sort by expiration
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setSortType('name')}
            disabled={!storageReady}
          >
            Sort by name
          </button>
        </div>

        <div className="fridge-data">
          <table>
            <caption>Your fridge items</caption>
            <thead>
              <tr>
                <th scope="col">Item name</th>
                <th scope="col">Days until expiration</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="2">Your fridge is empty.</td>
                </tr>
              ) : (
                displayedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.daysUntilExpiration}</td>
                  </tr>
                ))
              )}
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
          {nutritionData.map(({ nutrient, value }) => (
            <React.Fragment key={nutrient}>
              <dt>{nutrient}</dt>
              <dd>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      <nav className="site-nav" aria-label="Site links">
        <h2>Links</h2>
        <NavLink to="/chat">Go to the chatroom</NavLink>
      </nav>
    </main>
  );
}