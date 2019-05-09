const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//Delete and url from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
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
  res.send("Hello!");
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
  urlDatabase[makeid(6)] = req.body.longURL;
  res.send(urlDatabase);

  // Respond with 'Ok' (we will replace this)
});

// Redirects to the long URL corresponding to the short URL given
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  if (!urlDatabase[req.params.shortURL]) {
    // It is not in the database.

    res.send("notFound");
  } else {
    let longURL = urlDatabase[req.params.shortURL];
    if (!longURL) {
      res.send("notFound");
    } else {
      res.redirect(longURL);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
