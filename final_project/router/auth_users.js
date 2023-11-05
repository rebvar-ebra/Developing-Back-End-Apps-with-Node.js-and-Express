const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;


let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username; // The username should be obtained from the JWT token after authentication

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    // Delete the review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (authenticatedUser(username, password)) {
      // User authenticated, create a JWT token
      const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
      return res.status(200).json({ message: "Login successful", token });
    } else {
      // Authentication failed
      return res.status(401).json({ message: "Authentication failed" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review, username, token } = req.body;

    // Verify the token
    jwt.verify(token, secretKey, (err, decoded) => {
      console.log('Error:', err);
      console.log('Token:', token);
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      } else {
        // Check if the book exists
        if (books[isbn]) {
          // Check if the user is valid
          if (isValid(username)) {
            // Add or update the review
            books[isbn].reviews[username] = review;
            return res.status(200).json({ message: "Review added/updated successfully" });
          } else {
            return res.status(404).json({ message: "User not found" });
          }
        } else {
          return res.status(404).json({ message: "Book not found" });
        }
      }
    });
  });


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
