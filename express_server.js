const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// Generate random ID of 6 characters for new shortened URL or new user ID.
const generateRandomId = () => Math.random().toString(36).substr(2,6);

// Used to make the data more readable.
app.use(bodyParser.urlencoded({extended: true}));

// Used to help read the values from cookies.
app.use(cookieParser());

// Set the view engine to be EJS.
app.set("view engine", "ejs");

// Database to store shortened URLs.
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Database to store user data.
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// GET request for handling json files.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Used to keep track of all of the URLs and their shortened forms.
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Stores the key-value pairs (shortURL - longURL) into the urlDatabase object.
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomId();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Username registered as a cookie when login button is clicked.
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

// User's cookie data will be cleared and therefore logged out.
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

// Create new GET route to show the form in 'urls_new.js'.
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
});

// 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Handle request to delete an existing shortened URL.
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// Handle request to edit an existing URL.
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
})

// Direct new users to registration page.
app.get("/register", (req, res) => {
  res.render("register", {username: null});
})

// Create new user and add to the users database.
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userId = generateRandomId();
  users[userId] = {
    userId,
    email,
    password
  }
  res.cookie('userID', userId);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});