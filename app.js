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
    (username, password, done) => {
      Player.findOne({ where: { email: username } })
        .then(async (player) => {
          const result = await bcrypt.compare(password, player.password);
          if (result) {
            return done(null, player);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          console.log(error);
          return done(null, false, { message: "Invalid Mail" });
        });
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

const { Player, Sport, Session } = require("./models");
const { error } = require("console");

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.get("/", async (request, response) => {
  if (request.user) {
    return response.redirect("/sports");
  } else {
    response.render("index", {
      title: "Sports Scheduler",
      crsfToken: request.csrfToken(),
    });
  }
});

app.get("/signup", async (request, response) => {
  response.render("signup", {
    title: "Sign up",
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.get("/login", async (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.get("/signout", (request, response, next) => {
  request.logout((error) => {
    if (error) {
      return next(error);
    }
    response.redirect("/");
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user.role);
    response.redirect("/sports");
  }
);

app.post("/players", async (request, response) => {
  if (request.body.email.length == 0) {
    request.flash("error", "Email can't be empty!");
    return response.redirect("/signup");
  }
  if (request.body.name.length == 0) {
    request.flash("error", "Name cant be empty");
    return response.redirect("/signup");
  }
  if (request.body.password.length < 8) {
    request.flash("error", "Password must contain minimum of 8 characters");
    return response.redirect("/signup");
  }
  const submitValue = request.body.submit;
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
  try {
    if (submitValue === "admin") {
      const admin = await Player.create({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
        role: "admin",
      });
      request.login(admin, (err) => {
        if (err) {
          console.log(err);
        }
        response.redirect("/sports");
      });
    } else if (submitValue === "player") {
      const player = await Player.create({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
        role: "player",
      });
      request.login(player, (err) => {
        if (err) {
          console.log(err);
        }
        response.redirect("/sports");
      });
    } else {
      console.log("Invalid submit button");
    }
  } catch (error) {
    request.flash("error", "This mail already existes,try using a new mail");
    console.log(error);
    return response.redirect("/signup");
  }
});

app.get(
  "/sports",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log(request.user.id);
    try {
      const loggedInPlayer = request.user.id;
      const player = await Player.findByPk(loggedInPlayer);
      const playerName = player.dataValues.name;
      const allSports = await Sport.getSports(loggedInPlayer);
      const playerSports = await Sport.allSports();
      const sessions = await Session.getAllSessions();
      const currentTime = new Date();
      const upcomingSessions = [];
      const cancelledSessions = [];
      if (sessions.length > 0) {
        for (let i = 0; i < sessions.length; i++) {
          if (
            sessions[i].time > currentTime &&
            sessions[i].status == "running"
          ) {
            upcomingSessions.push(sessions[i]);
          } else {
            cancelledSessions.push(sessions[i]);
          }
        }
      }
      console.log("upcomingSessions", upcomingSessions);
      const userRole = player.dataValues.role;
      console.log(userRole);
      if (request.accepts("html")) {
        response.render("sports", {
          title: "Sports Page",
          playerName,
          allSports,
          playerSports,
          userRole,
          cancelledSessions,
          upcomingSessions,
          csrfToken: request.csrfToken(),
        });
      } else {
        response.json({ allSports });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

app.get(
  "/createSport",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (request.user.role === "admin") {
      response.render("createSport", {
        title: "Creating Sports",
        csrfToken: request.csrfToken(),
      });
    }
  }
);

app.post(
  "/creatingSport",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (request.user.role === "admin") {
      try {
        const sport = await Sport.createSport({
          name: request.body.sportsName,
          userId: request.user.id,
        });
        return response.redirect("/sports");
      } catch (error) {
        console.log(error);
      }
    } else {
      return response.redirect("/");
    }
  }
);

app.get(
  "/sports/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInPlayer = request.user.id;
    const player = await Player.findByPk(loggedInPlayer);
    const playerName = player.dataValues.name;
    const sport = await Sport.findByPk(request.params.id);
    const sportId = sport.dataValues.id;
    const session = await Session.getSessions(sportId);
    const sportName = sport.dataValues.name;
    const userRole = player.dataValues.role;
    if (request.accepts("html")) {
      response.render("sportSession", {
        title: "Sport Sessions",
        sportName,
        userRole,
        playerName,
        sportId,
        session,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({ sportName, userRole, playerName, sportId, session });
    }
  }
);

app.get(
  "/sports/:id/edit",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (request.user.role === "admin") {
      const sport = await Sport.findByPk(request.params.id);
      const sportId = sport.dataValues.id;
      response.render("editSport", {
        title: "Edit Sport",
        sportId,
        csrfToken: request.csrfToken(),
      });
    }
  }
);

app.post(
  "/sports/:id/edit",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (request.user.role === "admin") {
      const sport = await Sport.findByPk(request.params.id);
      const sportId = sport.dataValues.id;
      try {
        await Sport.editSport({
          name: request.body.name,
          id: sportId,
        });
        response.redirect(`/sports`);
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }
);

app.delete(
  "/deleteSport/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    if (request.user.role === "admin") {
      try {
        const res = await Sport.deleteSport(request.params.id);
        return response.json({ success: res === 1 });
      } catch (error) {
        return response.status(422).json(error);
      }
    }
  }
);

app.get(
  "/sport/:id/createSession",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const sport = await Sport.findByPk(request.params.id);
    const sportId = request.params.id;
    const sportName = sport.dataValues.name;
    response.render("session", {
      title: "Session",
      sportId,
      sportName,
      csrfToken: request.csrfToken(),
    });
  }
);

app.post(
  "/sport/:id/createSession",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const sportId = request.params.id;
    try {
      const allPlayers = request.body.playersJoining;
      const inputPlayers = allPlayers?.split(",").map((player) => player.trim());
      const session = await Session.create({
        time: request.body.time,
        venue: request.body.venue,
        participants: inputPlayers,
        playersNeeded: request.body.playersNeeded,
        sportId: sportId,
        userId: request.user.id,
      });
      return response.redirect(`/sports/${request.params.id}`);
    } catch (error) {
      console.log(error);
    }
  }
);

app.get(
  "/session/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const userId = request.user.id;
    try {
      const loggedInPlayer = request.user.id;
      const player = await Player.findByPk(loggedInPlayer);
      const playerName = player.dataValues.name;
      const sessionId = request.params.id;
      const session = await Session.findByPk(sessionId);
      const sportId = session.sportId;
      const sport = await Sport.getSport(sportId);
      const sportName = sport.name;
      const sessionTime = session.time;
      const sessionVenue = session.venue;
      const players = session.participants;
      const allPlayers = await Player.getPlayers();
      const currentTime = new Date();
      const playersList = [];
      const viewList = [];
      if (allPlayers.length > 0) {
        for (let i = 0; i < allPlayers.length; i++) {
          if (players.includes(allPlayers[i].name)) {
            playersList.push(allPlayers[i]);
          } else {
            viewList.push(allPlayers[i]);
          }
          console.log(allPlayers[i].name);
        }
      }
      if (request.accepts("html")) {
        response.render("allSessions", {
          session,
          sessionVenue,
          sessionTime,
          currentTime,
          sportName,
          sessionId,
          sportId,
          allPlayers,
          playerName,
          userId: request.user.id,
          players,
          playersList,
          viewList,
          title: "Session",
          csrfToken: request.csrfToken(),
        });
      } else {
        response.json({
          session,
          playersList,
          playerName,
          viewList,
          allPlayers,
          sportName,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

app.delete(
  "/deleteSession/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const res = await Session.deleteSession(request.params.id);
      return response.json({ success: res === 1 });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/joinSession/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const sessionId = request.params.id;
      const session = await Session.findByPk(request.params.id);
      const user = await Player.findByPk(request.user.id);
      const userName = user.name;
      const participants = session.participants;
      if (participants.length > 0) {
        if (participants.includes(userName)) {
          console.log("a", session.participants);
        } else {
          session.participants.push(request.user.name);
        }
      }
      const join = await Session.joinSession(
        session.participants,
        request.params.id
      );
      return response.json(join);
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/leaveSession/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const user = await Player.findByPk(request.user.id);
      const userName = user.name;
      const sessionId = request.params.id;
      const session = await Session.findByPk(request.params.id);
      const participants = session.participants;
      if (participants.length > 0) {
        if (participants.includes(userName)) {
          const index = session.participants.indexOf(userName);
          session.participants.splice(index, 1);
        } else {
          console.log(session.participants);
        }
      }
      console.log(session.participants);
      const leave = await Session.leaveSession(
        session.participants,
        request.params.id
      );
      return response.json(leave);
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/removePlayer/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const playerName = request.body.playerName;
      const session = await Session.findByPk(request.params.id);
      const participants = session.participants;
      if (participants.length > 0) {
        if (participants.includes(playerName)) {
          const index = session.participants.indexOf(playerName);
          session.participants.splice(index, 1);
        } else {
          console.log(session.participants);
        }
      }
      console.log(session.participants);
      const removed = await Session.removePlayer(
        session.participants,
        request.params.id
      );
      return response.json(removed);
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

app.get(
  "/updatePassword",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    response.render("updatePassword", {
      title: "Change Password",
      csrfToken: request.csrfToken(),
    });
  }
);

app.post(
  "/updatePassword",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const player = await Player.findOne({
      where: { id: request.user.id },
    });
    const newPassword = await bcrypt.hash(request.body.newPassword, saltRounds);
    if (request.body.newPassword == request.body.reEnterPassword) {
      await player.update({ password: newPassword });
      return response.redirect("/sports");
    } else {
      request.flash("error", "Passwords do not match,ReEnter again");
      response.redirect("/updatePassword");
    }
  }
);

app.get(
  "/session/:id/cancelSession",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    res.render("cancelSession", {
      title: "Cancel Session",
      csrfToken: req.csrfToken(),
      sessionId: req.params.id,
    });
  }
);

app.post(
  "/session/:id/cancelSession",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const session = await Session.findByPk(req.params.id);
      const sportId = session.sportId;
      await session.update({ reason: req.body.cancel, status: "cancelled" });
      return res.redirect(`/sports/${sportId}`);
    } catch (error) {
      console.log(error);
    }
  }
);

app.get(
  "/reports",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const userRole = request.user.role;
    const allSports = await Sport.getSports(request.user.id);
    const playerSports = await Sport.allSports();
    const sessions = await Session.getAllSessions();
    const runningSessions = await Session.runningSessions();
    const cancelledSessions = await Session.cancelledSessions();
    if (request.accepts("html")) {
      response.render("reports", {
        title: "Reports",
        userRole,
        allSports,
        playerSports,
        sessions,
        runningSessions,
        cancelledSessions,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        userRole,
        allSports,
        playerSports,
        sessions,
        runningSessions,
        cancelledSessions,
      });
    }
  }
);
module.exports = app;
