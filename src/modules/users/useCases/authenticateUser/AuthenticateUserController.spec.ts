import request from "supertest";
import { hash } from "bcryptjs";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;

describe("Authenticate user controller", () => {
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

  it("Should be able to authenticate user", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate user with invalid email", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "fakeemail@fakeemail.com",
      password: "johndoe",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("Should not be able to authenticate user with invalid password", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@hjohndoe.com",
      password: "fakepassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
