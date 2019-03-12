var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

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

// Test functionality.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});