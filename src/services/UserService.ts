import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";

export class UserService {
  /**
   * ✅ Obține un utilizator după ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    return await UserRepository.getById(userId);
  }

  /**
   * ✅ Obține un utilizator după email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await UserRepository.getByEmail(email);
  }
}

export default UserService;
