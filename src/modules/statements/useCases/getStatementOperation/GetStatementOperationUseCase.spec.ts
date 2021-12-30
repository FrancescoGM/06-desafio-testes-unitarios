import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementRepository: IStatementsRepository;
let usersRepository: IUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement operation use case", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementRepository
    );
  });

  it("Should be able to get statement operation", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    const statement = await statementRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation).toBeDefined();
    expect(statementOperation).toHaveProperty("id", statement.id);
    expect(statementOperation).toHaveProperty("type", OperationType.DEPOSIT);
  });

  it("Should not be able to get statement operation if user not exist", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get statement operation with non existent id", () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "John Doe",
        email: "johndoe@johndoe.com",
        password: "johndoe",
      });
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
