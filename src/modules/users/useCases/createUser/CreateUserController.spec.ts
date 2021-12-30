import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a user", async () => {
    const res = await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    expect(res.status).toBe(201);
  });

  it("Should not be able to create a user with the same existent email", async () => {
    const res = await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});
