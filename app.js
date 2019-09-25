const express = require("express");
const session = require("express-session");
const database = require("./database");
const bodyParser = require("body-parser");

const app = express();

let { PORT = 3000, SESSION_NAME = "sid" } = process.env;

app.use(
  session({
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: true,
    saveUninitialized: true,
    secret: "XCR3rsasa%RDHHH",
    cookie: { maxAge: 1000 * 60 * 60, sameSite: true }
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const redirectLogin = (req, res, next) => {
  console.log(req.session.userId);
  if (!req.session.userId) {
    console.log("i am here");
    return res.redirect("/login");
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/home");
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  let { userId } = req.session;

  res.send(
    `
    <a href="/login">Login</a>
    <a href="/register">Register</a>
    ${
      userId
        ? `
    <a href="/home">Home</a>
    
    
    `
        : ""
    }
    
   
    `
  );
});

app.get("/login", redirectHome, (req, res) => {
  res.send(
    `<a href="/register">Register</a><br><br> 
    <form action="/login" method="POST">
            Email:<input type="email" name="email"></input><br></br>
            Password: <input type="password" name="password"></input>
            <input type="submit"></input>
        </form>`
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  //check in database
  const user = database.find(
    element => element.email === email && element.password === password
  );

  if (user) {
    console.log("valid user", user.id);
    req.session.userId = user.id;
    return res.redirect(`/home`);
  } else {
    return res.redirect(`/login`);
  }
});

app.get("/register", redirectHome, (req, res) => {
  res.send(
    `<a href="/">Login</a><br><br>
    <form action="/register" method="POST">
      Name:<input type="text" name="name"></input>
      <br></br>
      Email:<input type="email" name="email"></input>
      <br></br>
      Password:<input type="password" name="password"></input>
      <br></br>
      Ocupation:<input type="text" name="ocupation"></input>
      <br></br>
      Date:<input type="date" name="date"></input>
      <br></br>
      <input type="submit"></input>
    </form>`
  );
});

app.post("/register", redirectHome, (req, res) => {
  const { name, email, password, ocupation, date } = req.body;
  console.log(name, email, password, ocupation, date);
  if (name && email && password && ocupation && date) {
    const status = database.some(
      element => element.email === email && element.password === password
    );
    if (!status) {
      database.push({
        id: database.length + 1,
        email,
        password,
        role: "user"
      });
      req.session.userId = document.length + 1;
      return res.redirect("/home");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/home", redirectLogin, (req, res) => {
  return res.send(
    `<h1>This is Home page</h1>
    <form action="/logout" method="POST">
    <input type="submit" value="logout">
    </form>
    `
  );
});

app.post("/logout", redirectLogin, (req, res) => {
  req.session.destroy(error => {
    console.log(error);
    return res.redirect("/home");
  });

  console.log("logged out");

  //res.clearCookie(SESSION_NAME);
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
