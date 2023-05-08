/* eslint-disable no-unused-vars */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELTE"]));
app.use(flash());

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "some-random-key4647847684654564",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        let player = Player.findOne({ where: { email: username } });
        if (!player) {
          return done(null, false);
        }
        const result = await bcrypt.compare(password, player.password);
        if (result && player.role === "admin") {
          return done(null, player);
        }
        return done(null, { id: player.id, role: player.role });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((player, done) => {
  console.log("serializing user in session", player.id);
  done(null, player.id);
});

passport.deserializeUser((id, done) => {
  Player.findByPk(id)
    .then((player) => {
      done(null, player);
    })
    .catch((error) => {
      done(error, null);
    });
});

const { Player } = require("./models");

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Sports Scheduler",
    crsfToken: request.csrfToken(),
  });
});

app.get("/signup", async (request, response) => {
  response.render("signup", {
    title: "Sign up",
    csrfToken: request.csrfToken(),
  });
});

app.post("/players", async (request, response) => {
  const submitValue = request.body.submit;
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPassword);
  console.log(request.body);
  try {
    if (submitValue === "admin") {
      const admin = await Player.create({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
        role: "admin",
      });
    } else if (submitValue === "player") {
      const player = await Player.create({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
        role: "player",
      });
    } else {
      console.log("Invalid submit button");
    }
  } catch (error) {
    // request.flash("error","This mail already existes,try using a new mail")
    console.log(error);
  }
});

app.get("/sports", async (request, response) => {
  // console.log(user)
});

app.get("/login", async (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});
module.exports = app;
