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

// Create new GET route to show the form in 'urls_new.js'.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
});

// 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
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