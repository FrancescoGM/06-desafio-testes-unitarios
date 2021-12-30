import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let statementRepository: IStatementsRepository;
let usersRepository: IUsersRepository;

describe("Create statement use case", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
  });

  it("Should be able to create a statement", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit",
    });

    expect(statement).toBeDefined();
    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("user_id");
  });

  it("should not be able to create a statement when user not exists", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "invalid-id",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create withdraw statement when there are no funds", () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "John Doe",
        email: "johndoe@johndoe.com",
        password: "johndoe",
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Should be able to create withdraw statement when there are funds", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });
    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit",
    });
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw",
    });

    expect(statement).toBeDefined();
    expect(statement).toHaveProperty("id");
  });
});
