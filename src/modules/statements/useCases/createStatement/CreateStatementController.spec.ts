import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";

let connection: Connection;
let token: string;

describe("Create statement controller", () => {
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

  it("Should not be able to create a withdraw statement with enough amount", async () => {
    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        type: "WITHDRAW",
        amount: 100,
        description: "Withdraw",
      })
      .auth(token, {
        type: "bearer",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("Should be able to create a deposit statement", async () => {
    const res = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        type: "DEPOSIT",
        amount: 100,
        description: "Deposit",
      })
      .auth(token, {
        type: "bearer",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("user_id");
    expect(res.body).toHaveProperty("type", "deposit");
    expect(res.body).toHaveProperty("amount", 100);
  });

  it("Should be able to create a withdraw statement", async () => {
    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        type: "WITHDRAW",
        amount: 100,
        description: "Withdraw",
      })
      .auth(token, {
        type: "bearer",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("user_id");
    expect(res.body).toHaveProperty("type", "withdraw");
    expect(res.body).toHaveProperty("amount", 100);
  });
});
