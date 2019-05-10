const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ secret: "e6Y;v#Q`e5%$QC$" }));

const urlDatabase = {
  "8sm5xK": {
    id: "8sm5xK",
    longURL: "http://www.facebook.com",
    userID: "userRandomID"
  },
  b2xVn2: {
    id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "user3RandomID"
  },
  "9sm5xK": {
    id: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user3RandomID"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@s.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@s.com",
    password: bcrypt.hashSync("123", 10)
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "c@s.com",
    password: bcrypt.hashSync("456", 10)
  }
};

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
// function to check if email is already used to register
function checkRepeat(email) {
  var didRepeat = false;
  for (var user in users) {
    if (users[user].email === email) {
      didRepeat = true;
      break;
    }
  }
  return didRepeat;
}

// function to check for email and passwords match database
function authenticateUser(email, password) {
  var isAuthenticated = false;
  var result;
  for (var key in users) {
    if (
      users[key].email === email &&
      bcrypt.compareSync(password, users[key].password)
    ) {
      isAuthenticated = true;
      result = key;
      break;
    }
  }
  if (isAuthenticated) {
    return users[result];
  } else {
    return false;
  }
}

app.get("/", (req, res) => {
  let userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let templateVars;
  let userID = req.session.user_id;
  if (userID) {
    templateVars = {
      urls: urlDatabase,
      user: users[userID]
    };
    res.render("urls_index", templateVars);
  } else {
    templateVars = {
      urls: urlDatabase,
      user: false
    };
    res.render("urls_index", templateVars);
  }
});

//register
app.get("/register", (req, res) => {
  return res.render("urls_register");
});

app.post("/register", (req, res) => {
  var result = checkRepeat(req.body.email);
  if (req.body.email === "" || req.body.password === "") {
    return res.send(401);
  }
  if (result === true) {
    res.send(401);
  } else {
    let user = {
      id: makeid(6),
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    users[user.id] = user;
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});
// Form to create a new short URL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// Redirects to the long URL corresponding to the short URL given
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    res.send("notFound");
  } else {
    let longURL = url.longURL;
    if (!longURL) {
      res.send("notFound");
    } else {
      res.redirect(longURL);
    }
  }
});

//Delete and url from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/", (req, res) => {
  // console.log(req.body);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// The form to edit an URL
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      shortURL: req.params.id,
      urls: urlDatabase[req.session.user_id][req.params.id],
      user: users[req.session.user_id]
    };
    return res.render("urls_show", templateVars);
  } else {
    return res.redirect("/register");
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.session.user_id][req.params.id] = req.body.urls;
  return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// The form to do a login
app.get("/login", (req, res) => {
  return res.render("urls_login");
});

// sets cookie and/or redirects accordingly
app.post("/login", (req, res) => {
  var result = authenticateUser(req.body.email, req.body.password);
  //the user credentials matches
  if (result) {
    req.session.user_id = result.id;
    return res.redirect("/urls");
  } else {
    //the user credentials don't match
    return res.send(403);
  }
});

//log out
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  req.session = null;
  return res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[makeid(6)] = req.body.longURL;
  // res.send(urlDatabase);
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
