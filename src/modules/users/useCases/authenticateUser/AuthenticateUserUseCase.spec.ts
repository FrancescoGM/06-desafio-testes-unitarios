import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

const user = {
  email: "johndoe@johndoe.com",
  name: "John Doe",
  password: "johndoe",
};

describe("Authenticate user use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("Should be able to authenticate the user", async () => {
    await createUserUseCase.execute(user);
    const response = await authenticateUserUseCase.execute({
      email: "johndoe@johndoe.com",
      password: "johndoe",
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("user");
  });

  it("Should not be able to authenticate when the user does not exist", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "johndoe@johndoe.com",
        password: "johndoe",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate with the wrong password", () => {
    expect(async () => {
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: "johndoe@johndoe.com",
        password: "wrongpassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
