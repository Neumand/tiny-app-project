const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// Used to make the data more readable.
app.use(bodyParser.urlencoded({extended: true}));

// Used to help read the values from cookies.
app.use(cookieParser());

// Set the view engine to be EJS.
app.set("view engine", "ejs");

// Database to store shortened URLs.
const urlDatabase = {
  "b2xVn2":{longURL:"http://www.lighthouselabs.ca", userId: "userRandomID"},
  "9sm5xK":{longURL:"http://www.google.com", userId: "user2RandomID"}
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
// Generate random ID of 6 characters for new shortened URL or new user ID.
const generateRandomId = () => Math.random().toString(36).substr(2,6);

// Checks if an email already exists in the database and returns a boolean.
const emailVerification = (email) => {
  const usersArr = Object.values(users);
  return usersArr.some(check => check.email === email);
}

// If email exists in the DB during login, check if the password corresponds to the email.
const passwordVerification = (password) => {
  const usersArr = Object.values(users);
  return usersArr.some(check => check.password === password);
}

// Find user's ID for login requests.
const findUserId = (email, password) => {
  let userId = '';
  for (id in users) {
    if (users[id]["email"] === email && users[id]["password"] === password) {
      userId = users[id]["id"];
    } else {
      userId = null;
    }
  }
  return userId;
}

// Returns the URLs where the userID is equal to the id of the currently logged in user.
const urlsForUser = (id) => {
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userId"] === id) {
    userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

// Used to keep track of all of the URLs and their shortened forms.
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

// Stores the key-value pairs (shortURL - longURL) into the urlDatabase object.
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  let longURL = req.body.longURL;
  let shortURL = generateRandomId();
  urlDatabase[shortURL] = {longURL: longURL, userId: userId};
  res.redirect(`/urls/${shortURL}`);
});

// Direct existing users to login page.
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("login", templateVars);
})

// Log in an existing user, verifying that their email exists in the DB and password matches.
app.post("/login", (req, res) => {
  const email = req.body.email === '' ? null : req.body.email;
  const password = req.body.password === '' ? null : req.body.password;
  let userId = findUserId(email, password);
  if (emailVerification(email)) {
    if (passwordVerification(password)) {
        res.cookie("user_id", userId);
        res.redirect("/urls");
      } else {
        res.status(403).send("Incorrect password. Please try again.");
      }
  } else {
    res.send("No account found with provided email address.")
  }
})

// User's cookie data will be cleared and therefore logged out.
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// Create new GET route to show the form in 'urls_new.js'.
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  if (!userId) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
});

// 
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  let userURLs = urlsForUser(userId);
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[userId],
    urls: userURLs
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
  const userId = req.cookies["user_id"];
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {longURL: longURL, userId: userId};
  res.redirect("/urls");
})

// Direct new users to registration page.
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("register", templateVars);
})

// Create new user and add to the users database.
// See emailVerification function description above.
app.post("/register", (req, res) => {
  const email = req.body.email === '' ? null : req.body.email;
  const password = req.body.password === '' ? null : req.body.password;
  if (email === null || password === null || emailVerification(email)) {
    res.status(404).end();
  } else {
    const userId = generateRandomId();
    users[userId] = {
      id: userId,
      email,
      password
    }
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
})

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});