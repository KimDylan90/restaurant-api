const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database(':memory:');

// Create restaurants table in the database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      address TEXT,
      category TEXT
    )
  `);
});

// Get all restaurants
app.get('/restaurants', (req, res) => {
  db.all('SELECT * FROM restaurants', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve restaurants from the database.' });
    }

    res.json(rows);
  });
});

// Create a new restaurant
app.post('/restaurant', (req, res) => {
  const { name, address, category } = req.body;

  // Check if all required fields are present
  if (!name || !address || !category) {
    return res.status(400).json({ error: 'Name, address, and category are required.' });
  }

  // Insert new restaurant into the database
  const stmt = db.prepare('INSERT INTO restaurants (name, address, category) VALUES (?, ?, ?)');
  stmt.run(name, address, category, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to insert restaurant into the database.' });
    }

    res.status(201).json({ id: this.lastID, name, address, category });
  });

  stmt.finalize();
});

// Get a specific restaurant by ID
app.get('/restaurant/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM restaurants WHERE id = ?', id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve restaurant from the database.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json(row);
  });
});

// Update a specific restaurant by ID
app.put('/restaurant/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, category } = req.body;

  // Check if the restaurant exists
  db.get('SELECT * FROM restaurants WHERE id = ?', id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve restaurant from the database.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    // Update the restaurant in the database
    const stmt = db.prepare('UPDATE restaurants SET name = ?, address = ?, category = ? WHERE id = ?');
    stmt.run(name, address, category, id, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update restaurant in the database.' });
      }

      res.json({ id, name, address, category });
    });

    stmt.finalize();
  });
});

// Delete a specific restaurant by ID
app.delete('/restaurant/:id', (req, res) => {
  const { id } = req.params;

  // Check if the restaurant exists
  db.get('SELECT * FROM restaurants WHERE id = ?', id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve restaurant from the database.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    // Delete the restaurant from the database
    const stmt = db.prepare('DELETE FROM restaurants WHERE id = ?');
    stmt.run(id, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete restaurant from the database.' });
      }

      res.json(row);
    });

    stmt.finalize();
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
