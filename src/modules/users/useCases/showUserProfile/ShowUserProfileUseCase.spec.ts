import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
const user = {
  email: "johndoe@johndoe.com",
  name: "John Doe",
  password: "johndoe",
};

describe("Show user profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to show the user profile", async () => {
    const createdUser = await usersRepository.create(user);
    const userProfile = await showUserProfileUseCase.execute(
      createdUser.id as string
    );

    expect(userProfile).toHaveProperty("id");
  });

  it("Should not be able to show the user profile when not exist", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("test");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
