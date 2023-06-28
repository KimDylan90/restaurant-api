const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// In-memory restaurant list
let restaurants = [
  {
    name: 'Restaurant A',
    address: '123 Main Street',
    category: 'Italian'
  },
  {
    name: 'Restaurant B',
    address: '456 Elm Street',
    category: 'Greek'
  }
];

// Get all restaurants
function getAllRestaurants(req, res) {
  res.json(restaurants);
}

// Create a new restaurant
function createRestaurant(req, res) {
  const { name, address, category } = req.body;

  // Check if all required fields are present
  if (!name || !address || !category) {
    return res.status(400).json({ error: 'Name, address, and category are required.' });
  }

  // Check if the restaurant already exists
  const existingRestaurant = restaurants.find(restaurant => restaurant.name === name);
  if (existingRestaurant) {
    return res.status(400).json({ error: 'Restaurant already exists.' });
  }

  const newRestaurant = { name, address, category };
  restaurants.push(newRestaurant);

  res.status(201).json(newRestaurant);
}

// Get restauran by name
function getRestaurantByName(req, res) {
  const { name } = req.params;
  const restaurant = restaurants.find(restaurant => restaurant.name === name);

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  res.json(restaurant);
}

// Update restaurant by name
function updateRestaurantByName(req, res) {
  const { name } = req.params;
  const { address, category } = req.body;

  // Check if restaurant exists
  const existingRestaurant = restaurants.find(restaurant => restaurant.name === name);
  if (!existingRestaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  // Update the restaurant object
  existingRestaurant.address = address || existingRestaurant.address;
  existingRestaurant.category = category || existingRestaurant.category;

  res.json(existingRestaurant);
}

// Delete a specific restaurant by name
function deleteRestaurantByName(req, res) {
  const { name } = req.params;

  // Find the index of the restaurant to delete
  const restaurantIndex = restaurants.findIndex(restaurant => restaurant.name === name);
  if (restaurantIndex === -1) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  // Remove the restaurant from the list
  const deletedRestaurant = restaurants.splice(restaurantIndex, 1)[0];

  res.json(deletedRestaurant);
}

// Routes
app.get('/restaurants', getAllRestaurants);
app.post('/restaurant', createRestaurant);
app.get('/restaurant/:name', getRestaurantByName);
app.put('/restaurant/:name', updateRestaurantByName);
app.delete('/restaurant/:name', deleteRestaurantByName);

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
