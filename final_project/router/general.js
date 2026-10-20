const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ---------------------------------------------------------------
// Promise-based helpers used by the routes below (Task 10)
// ---------------------------------------------------------------

// Returns a Promise that resolves with all books
const fetchAllBooks = () => {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject(new Error("Books not available"));
    }
  });
};

// Returns a Promise that resolves with one book by ISBN
const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });
};

// Returns a Promise that resolves with all books by an author
const fetchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const result = {};
    Object.keys(books).forEach((key) => {
      if (books[key].author === author) {
        result[key] = books[key];
      }
    });
    if (Object.keys(result).length > 0) {
      resolve(result);
    } else {
      reject(new Error("No books found for this author"));
    }
  });
};

// Returns a Promise that resolves with all books with a title
const fetchBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const result = {};
    Object.keys(books).forEach((key) => {
      if (books[key].title === title) {
        result[key] = books[key];
      }
    });
    if (Object.keys(result).length > 0) {
      resolve(result);
    } else {
      reject(new Error("No books found with this title"));
    }
  });
};

// Task 1 + Task 10: Get the book list available in the shop (async/await)
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await fetchAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 2 + Task 10: Get book details based on ISBN (async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await fetchBookByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 3 + Task 10: Get book details based on author (async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const result = await fetchBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 4 + Task 10: Get all books based on title (async/await)
public_users.get('/title/:title', async function (req, res) {
  try {
    const result = await fetchBooksByTitle(req.params.title);
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

// ---------------------------------------------------------------
// Task 10: Client methods using Axios with async/await
// ---------------------------------------------------------------

// Method 1: Get all books using Axios (async/await)
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
  }
};

// Method 2: Get book details by ISBN using Axios (async/await)
const getBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching book by ISBN:", error.message);
  }
};

// Method 3: Get book details by author using Axios (async/await)
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
  }
};

// Method 4: Get book details by title using Axios (async/await)
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by title:", error.message);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;