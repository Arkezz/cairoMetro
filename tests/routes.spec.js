const request = require("supertest");
const app = require("../src/app.js"); // Your Koa app
const { createUser, authenticateUser } = require("../src/controllers/auth.js"); // Your controllers

describe("Authentication Routes", () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a user to test authentication routes
    const user = await createUser({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password",
    });
    userId = user._id;

    // Authenticate the user and get an access token
    const { body } = await request(app.callback())
      .post("/login")
      .send({ email: "johndoe@example.com", password: "password" });
    authToken = body.access_token;
  });

  describe("POST /register", () => {
    test("should create a new user", async () => {
      const res = await request(app.callback()).post("/register").send({
        name: "Jane Doe",
        email: "janedoe@example.com",
        password: "password",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual("Jane Doe");
      expect(res.body.email).toEqual("janedoe@example.com");
    });
  });

  describe("POST /login", () => {
    test("should authenticate user and return access token", async () => {
      const res = await request(app.callback())
        .post("/login")
        .send({ email: "johndoe@example.com", password: "password" });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("access_token");
    });

    test("should return 401 Unauthorized for invalid credentials", async () => {
      const res = await request(app.callback())
        .post("/login")
        .send({ email: "johndoe@example.com", password: "wrongpassword" });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /user-info", () => {
    test("should return user info for authenticated user", async () => {
      const res = await request(app.callback())
        .get("/user-info")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(userId);
      expect(res.body.name).toEqual("John Doe");
      expect(res.body.email).toEqual("johndoe@example.com");
    });

    test("should return 401 Unauthorized for unauthenticated user", async () => {
      const res = await request(app.callback()).get("/user-info");
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  afterAll(async () => {
    // Clean up by deleting the user
    await User.deleteOne({ _id: userId });
  });
});
