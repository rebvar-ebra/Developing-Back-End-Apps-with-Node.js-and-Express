const express = require('express');
let books = require("./booksdb.js"); // Assuming this is an object where the key is the ISBN and the value is book details
let isValid = require("./auth_users.js").isValid; // Assuming this is a function to validate users
let users = require("./auth_users.js").users; // Assuming this is an array of user objects
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Basic input validation
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ message: "Invalid or missing username" });
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ message: "Invalid or missing password" });
  }

  // Check if the username is already taken
  if (isValid(username)) {
    return res.status(409).json({ message: "Username is already taken" });
  }

  // Add the new user to the 'users' array
  users.push({ username, password });

  // Respond with success message
  return res.status(201).json({ message: "Customer registered, now you can login" });
});
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Assuming 'books' is an object, convert it to an array of books
  const bookList = Object.values(books);
  return res.status(200).json(bookList);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const booksByTitle = Object.values(books).filter(book => book.title === title);
  return res.status(200).json(booksByTitle);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book or reviews not found" });
  }
});

module.exports.general = public_users;
