import request from "supertest";
import app from "../src/app.js"; // Your Koa app
import { deleteUser } from "../src/db.js";
import { createUser } from "../src/controllers/auth.js"; // Your controllers

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

  afterAll(async () => {
    // Clean up by deleting the user
    await deleteUser(userId);
  });
});
