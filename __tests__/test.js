const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Sports Scheduler", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(8000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/players").send({
      name: "Pavan",
      email: "test2@gmail.com",
      password: "12345678",
      _csrf: csrfToken,
      submit: "admin",
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/sports");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/sports");
    expect(res.statusCode).toBe(302);
  });


  test("Creating a sport", async () => {
    const agent = request.agent(server);
    await login(agent, "test2@gmail.com", "12345678");
    const user = request.user
    console.log(user)
    const res = await agent.get("/createSport");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/creatingSport").send({
      name: "Cricket",
      _csrf: csrfToken,
    });
    console.log(response.body.name)
    const QResponse = await agent
    .get(`/sports`)
    .set("Accept", "application/json");
  const parsedGroupedResponse = JSON.parse(QResponse.text);
  console.log(parsedGroupedResponse)
  console.log(response.body.id)
    expect(response.statusCode).toBe(302);
  });

  test("creating a session",async()=>{
    const agent = request.agent(server)
    await login(agent,"test2@gmail.com","12345678")
    const user = agent.user
    console.log(user)
    let res = await agent.get("/createSport")
    let csrf = extractCsrfToken(res)
    await agent.post("/sports").send({
      name:"cricket",
      _csrf:csrf
    });
    const groupedResponse = await agent
    .get("/sports")
    .set("Accept", "Application/json");
  const parsedResponse = JSON.parse(groupedResponse.text);
  console.log(parsedResponse);
  const totalSports = parsedResponse.allSports.length;
  const recentSport = parsedResponse.allSports[totalSports - 1];
  res = await agent.get(`/sport/${recentSport.id}/createSession`)
  let csrfToken = extractCsrfToken(res)
  res = await agent.post(`/sport/${recentSport.id}/createSession`).send({
    time: new Date(),
    venue: "stadium",
    participants:"pavan",
    playersNeeded: 4,
    sportId:recentSport.id,
    _csrf:csrfToken
  })
  expect(res.statusCode).toBe(302)
  })
//  test("Editing a sportName",async()=>{
//       const agent = request.agent(server)
//       await login(agent,"test2@gmail.com","12345678")
//       let res = await agent.get("/createSport")
//       let csrfToken = extractCsrfToken(res)
//       const sport = await agent.post("/creatingSport").send({
//           name:"Cricket",
//           _csrf:csrfToken
//       })
//       const  = await Sport
//       // const sportId = sport.body.id
//       // expect(sportId).toBeDefined()
//       // console.log("created",sportId)
//       const getSportResponse = await agent.get(`/sport/${sportId}/edit`)
//       csrfToken = extractCsrfToken(getSportResponse)
//       const editResponse = await agent.post(`/sport/${sportId}/edit`).send({
//         name:"Soccer",
//         _csrf:csrfToken
//       })
//       expect(editResponse.statusCode).toBe(302)
//       // const spRes = await agent.get("/sports").set("Accept","Application/json");
//       // const parsedResponse = JSON.parse(spRes.text)
//       // const sportId = parsedResponse.id
//       // res = await agent.get(`/sport/${sportId}/edit`)
//       // csrfToken = extractCsrfToken(res)
//       // res = await agent.post(`/sport/${sportId}/edit`).send({
//       //   name:"cricket",
//       //   _csrf:csrfToken
//       // })
//       // expect(res.statusCode).toBe(302)
//     })
// test("creating a session",async()=>{
//   const agent = request.agent(server)
//   await login(agent,"test2@gmail.com","12345678")
//   const res = await agent.get("/createSport");
//   const csrfToken = extractCsrfToken(res);
//   const response = await agent.post("/creatingSport").send({
//     name: "Cricket",
//     _csrf: csrfToken,
//   });
//   const res = await agent.get
// })
   
});
