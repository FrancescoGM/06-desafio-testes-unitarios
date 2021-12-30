import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementRepository: IStatementsRepository;
let usersRepository: IUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance use case", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      usersRepository
    );
  });

  it("Should be able to get balance", async () => {
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

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toBeDefined();
    expect(balance).toHaveProperty("balance", 100);
    expect(balance).toHaveProperty("statement", [statement]);
  });

  it("Should not be able to get balance if user not exist", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "123",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
