const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// Middleware to make the data more readable.
app.use(bodyParser.urlencoded({extended: true}));

// Middleware to parse values from cookies.
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Set the view engine to be EJS.
app.set("view engine", "ejs");

// Database to store shortened URLs.
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userId: "userRandomID"},
  "9sm5xK": {longURL:"http://www.google.com", userId: "user2RandomID"}
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

// Search the users database for hashed password.
const findHashedPassword = (email) => {
  let hashedPassword = '';
  for (const userId in users) {
    if (users[userId]["email"] === email) {
      hashedPassword = users[userId]["hashedPassword"];
    }
  }
  return hashedPassword;
}

// Find user's ID for login requests.
const findUserId = (email, hashedPassword) => {
  let userId = '';
  for (const id in users) {
    if (users[id]["email"] === email && users[id]["hashedPassword"] === hashedPassword) {
      userId = users[id]["id"];
    } else {
      userId = null;
    }
  }
  return userId;
}

// Check userId in DB versus currently logged in user.
const verifyUserId = (userId) => {
  let condition = '';
  for (const id in users) {
    if (users[id]["id"] === userId) {
      condition = true;
    } else {
      condition = false;
    }
  }
  return condition;
}

// Returns URLs where the userID is equal to the id of the currently logged in user.
const urlsForUser = (id) => {
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userId"] === id) {
    userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

// Display long and shortened URLs.
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

// Store new URLs into the database .
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  let longURL = req.body.longURL;
  let shortURL = generateRandomId();
  if (userId) {
  urlDatabase[shortURL] = {longURL: longURL, userId: userId};
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }
});

// Direct existing users to login page.
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("login", templateVars);
})

// Login request. Includes verification that email exists in the DB and hashed password matches.
app.post("/login", (req, res) => {
  const email = req.body.email === '' ? null : req.body.email;
  const password = req.body.password === '' ? null : req.body.password;
  const hashedPassword = findHashedPassword(email);
  let userId = findUserId(email, hashedPassword);
  if (emailVerification(email)) {
    if (bcrypt.compareSync(password, hashedPassword)) {
        req.session.user_id = userId;
        res.redirect("/urls");
      } else {
        res.status(403).send("<h1>Incorrect password. Please try again.</h1>");
      }
  } else {
    res.send("<h1>No account found with provided email address.</h1>")
  }
})

// Reset user cookie data upon logout.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

// Display form to create new shortened URL.
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
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

// Shortcut to acessing the original web page using the shortened URL.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(`${longURL}`);
});

// Display the user's newly shortened URL.
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  let userURLs = urlsForUser(userId);
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[userId],
    urls: userURLs
  };
  if (verifyUserId(userId) && urlDatabase[req.params.shortURL]["userId"] === userId) {
  res.render("urls_show", templateVars);
  } else {
    res.status(403).send("<h1>Error: Authorization denied.</h1>");
  }
});

// Handle request to delete an existing shortened URL.
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (verifyUserId(userId) && urlDatabase[shortURL]["userId"] === userId) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    } else {
      res.status(403).send("<h1>Error: Authorization denied.</h1>");
    }
})

// Handle request to edit an existing URL.
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  let longURL = req.body.longURL;
  let shortURL = req.params.shortURL;
  if (verifyUserId(userId) && urlDatabase[shortURL]["userId"] === userId) {
  urlDatabase[shortURL] = {longURL: longURL, userId: userId};
  res.redirect("/urls");
  } else {
    res.status(403).send("<h1>Error: Authorization denied.</h1>");
  }
})

// Direct new users to registration page.
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  let userURLs = urlsForUser(userId);
  let templateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("register", templateVars);
})

// Create new user and add to the users database after verifying the email does not aready exist.
app.post("/register", (req, res) => {
  const email = req.body.email === '' ? null : req.body.email;
  const password = req.body.password === '' ? null : req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === null || password === null || emailVerification(email)) {
    res.status(404).send("<h1>User already exists - please register with different email.</h1>");
  } else {
    const userId = generateRandomId();
    users[userId] = {
      id: userId,
      email,
      hashedPassword
    }
    req.session.user_id = userId;
    res.redirect("/urls");
  }
})

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});