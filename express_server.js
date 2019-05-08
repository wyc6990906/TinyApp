const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateRandomString(howMany = 6) {
  let rndStr = "";
  const charset = "0123456789ABCDEFGHIJLKNOPQRSTVYXZabcdefghiklmnopqrstvyzx";

  for (let i = 0; i < howMany; i++) {
    const index = getRandomInt(charset.length);
    rndStr += charset.charAt(index);
  }

  return rndStr;
}

// Form to create a new short URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// The form to edit an URL
app.get("/urls/:id", (req, res) => {
  if ((req.session.user_id, req.params.id)) {
    const user = users[req.session.user_id];
    const templateVars = {
      user: user,
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("Sorry, only the owner can edit a URL!");
  }
});

app.get("/", (req, res) => {
  response.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//// Redirects to the long URL corresponding to the short URL given
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    // It is not in the database.
    res.redirect("/notFound");
  } else {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.redirect("/notFound");
    } else {
      res.redirect(longURL);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
