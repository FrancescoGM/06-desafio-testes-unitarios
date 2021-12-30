import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
const user = {
  name: "John Doe",
  email: "johndoe@johndoe.com",
  password: "johndoe",
};

describe("Create user use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create a user", async () => {
    const newUser = await createUserUseCase.execute(user);

    expect(newUser).toHaveProperty("id");
    expect(newUser).toHaveProperty("name", user.name);
    expect(newUser).toHaveProperty("email", user.email);
  });

  it("Should not be able to create a user when already exist", async () => {
    await createUserUseCase.execute(user);
    expect(async () => {
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
