const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// Generate random string of 6 characters to assign to new shortened URL.
const generateRandomStrings = () => Math.random().toString(36).substr(2,6);

// Used to make the data more readable.
app.use(bodyParser.urlencoded({extended: true}));

// Used to help read the values from cookies.
app.use(cookieParser());

// Set the view engine to be EJS.
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let shortURL = generateRandomStrings();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Username registered as a cookie when login button is clicked.
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  let username = req.body.username;
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});