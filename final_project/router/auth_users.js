const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return username.length >= 4;

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  const user = users.find((user) => user.username === username && user.password === password);
  
  return !!user;

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;

  if(!isValid(username)){
    return res.status(400).json({message: "Invalid user name"});
  }

  if(authenticatedUser(username, password)){
    return res.status(404).json({message: "Authentication failed"});
  }

  const token = jwt.sign({ username }, 'your_secret_key_here');

  return res.status(200).json({message: "Customer successfully logged in.", token});

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers;
  const { isbn } = req.params;
  const { review } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key_here");
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {}; // Initialize reviews object if not exists
    }

    // Check if the user already has a review for this book
    if (books[isbn].reviews[username]) {
      // If review is provided, update the existing review, else delete it
      if (review) {
        books[isbn].reviews[username] = review;
      } else {
        delete books[isbn].reviews[username];
      }
    } else {
      // Add the review to the book's reviews object
      books[isbn].reviews[username] = review;
    }

    return res.status(200).json({ message: `The review for the book of ISBN ${isbn} has been add / updated.` });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers;
  const { isbn } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key_here");
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Check if the user has a review for this book
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: `Review for the ISBN ${isbn} posted by the ${username} deleted.` });
    } else {
      return res.status(404).json({ message: "No review found for this user" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
