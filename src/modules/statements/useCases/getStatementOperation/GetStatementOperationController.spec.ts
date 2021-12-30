import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";

let connection: Connection;
let token: string;

describe("Get statement operation controller", () => {
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

  it("Should be able to create a deposit statement and get it", async () => {
    const resDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        type: "DEPOSIT",
        amount: 100,
        description: "Deposit",
      })
      .auth(token, {
        type: "bearer",
      });

    const resGet = await request(app)
      .get(`/api/v1/statements/${resDeposit.body.id}`)
      .auth(token, {
        type: "bearer",
      });

    expect(resGet.status).toBe(200);
    expect(resGet.body).toHaveProperty("id");
    expect(resGet.body).toHaveProperty("user_id");
    expect(resGet.body).toHaveProperty("type", "deposit");
    expect(resGet.body).toHaveProperty("amount", "100.00");
  });

  it("Should not be able to get a statement that does not exist", async () => {
    const res = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .auth(token, {
        type: "bearer",
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});
