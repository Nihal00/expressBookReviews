const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;

  const userExits = users.find((user) => user.username === username);

  if(userExits){
    return res.status(400).json({message: "User already exits"});
  }

  const newUser = {username, password};

  users.push(newUser);

  return res.status(201).json({message: "Customer successfully register. Now you can login"})

});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try {
    const book = await getBooks();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(400).json({message: "Books not found"})
  }

});
const getBooks = async () => {
  return new Promise((res, rej) => {
    setTimeout(() => res(books), 1000)
  })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isbn = req.params.isbn;
        const book = Object.values(books).find((book) => book.isbn === isbn);
        
        if(!book){
          return res.status(404).json({message: "Books not found"})
        }
        
        return res.status(200).json({book});
      }, 1000)
    })
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  const booksByAuthor  = Object.values(books).filter((book) => book.author === author);

  if(booksByAuthor.length === 0){
    return res.status(404).json({message: "No books found for this author"});
  }



  return res.status(200).json({booksByAuthor});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  const booksbyTitle  = Object.values(books).filter((book) => book.title === title);

  if(booksbyTitle.length === 0){
    return res.status(404).json({message: "No books found with that"});
  }

  return res.status(200).json({booksbyTitle});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  const book = Object.values(books).filter((book) => book.isbn === isbn);

  if(!book){
    return res.status(404).json({message: "Book not found"})
  }

  const review = book.review
  
  return res.status(200).json({ isbn: book.isbn, review })
});

module.exports.general = public_users;
