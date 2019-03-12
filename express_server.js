var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

// Generate random string of 6 characters to assign to new shortened URL.
const generateRandomStrings = () => Math.random().toString(36).substr(2,6);

// Used to make the data more readable.
app.use(bodyParser.urlencoded({extended: true}));

// Set the view engine to be EJS.
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GET request for the homepage.
app.get("/", (req, res) => {
  res.send("Hello!");
});

// GET request for handling json files.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Used to keep track of all of the URLs and their shortened forms.
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Create new GET route to show the form in 'urls_new.js'.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Stores the key-value pairs (shortURL - longURL) into the urlDatabase object.
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomStrings();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Test functionality.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});