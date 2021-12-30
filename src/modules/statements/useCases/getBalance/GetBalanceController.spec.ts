import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";

let connection: Connection;
let token: string;

describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("johndoe", 8);

    await connection.query(`
    INSERT INTO USERS(id, name, email, password, created_at, updated_at)
    VALUES('${id}', 'johndoe', 'johndoe@johndoe.com', '${password}', 'NOW()', 'NOW()')
    `);

    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    token = resToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get balance", async () => {
    const res = await request(app)
      .get("/api/v1/statements/balance")
      .auth(token, {
        type: "bearer",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("balance");
    expect(res.body).toHaveProperty("statement", []);
  });

  it("Should not be able to get balance without token", async () => {
    const res = await request(app).get("/api/v1/statements/balance");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
