import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";

let connection: Connection;

describe("Show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("johndoe", 8);

    await connection.query(`
    INSERT INTO USERS(id, name, email, password, created_at, updated_at)
    VALUES('${id}', 'johndoe', 'johndoe@johndoe.com', '${password}', 'NOW()', 'NOW()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show user profile", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    const res = await request(app)
      .get("/api/v1/profile")
      .auth(resToken.body.token, {
        type: "bearer",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
  });

  it("Should not be able to show user profile without token", async () => {
    const res = await request(app).get("/api/v1/profile");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("Should not be able to show user profile with invalid token", async () => {
    const res = await request(app).get("/api/v1/profile").auth("invalidtoken", {
      type: "bearer",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
