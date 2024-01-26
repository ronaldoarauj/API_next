import { ICreateUserRequest, IUser } from "../entities";
import { userRepository } from "../repositories";

const createUser = async (req: ICreateUserRequest): Promise<IUser> => {

    const hasUser = await userRepository.findByEmail(req.email)
    if (hasUser) throw new Error("Usuario já existe");
    const user: IUser = {
        avatar: req.avatar,
        details: req.details,
        email: req.email,
        name: req.name,
        isActive: true,

    };

    await userRepository.saveUser(user)

    return user;
};

const findAllUsers = async (): Promise<IUser[]> => {
    const users: IUser[] = await userRepository.findAllUsers()
    return users

}

const findByID = async (id: string): Promise<IUser | undefined> => {
    const hasUsers: IUser = await userRepository.findByID(id)
    return hasUsers

}

export const userController = {
    createUser,
    findAllUsers,
    findByID,

    async getById() { },

    async updateByid() { },

    async removeById() { },
};

