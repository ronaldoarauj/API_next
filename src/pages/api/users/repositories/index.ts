import { randomUUID } from "crypto";
import { IUser } from "../entities";
import { query } from "../../lib/db";




let users: IUser[] = []

const saveUser = async (user: IUser): Promise<void> => {
    //const userWithID: IUser = { ...user, id: randomUUID() };
    users = [...users,]
};

const findAllUsers = async (): Promise<IUser[]> => {
    try {
        const result = await query({
            query: "SELECT id, name, email, status FROM grace_user",
        });
    
        const users = result as IUser[];
    
        return users ;
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        throw new Error(error.message);
    }
}


// const list = async (): Promise<IUser[]> => {
//     try {
//       const results = await query({
//         query: "SELECT id, name, email, status, avatar FROM grace_user",
//       });
  
//       // Mapeie os resultados para o formato de IUser
//       const userList = results.map((result: any) => result as IUser);
  
//       return userList;
//     } catch (error) {
//       console.error('Erro ao listar usuários:', error);
//       throw new Error(error.message);
//     }
//   };

const findByEmail = async (email: string): Promise<IUser | undefined> => {
    const user = users.find(existingUser => existingUser.email === email)
    return user;
}
const findByID = async (id: string): Promise<IUser | undefined> => {
    try {
        const userId = id;
        //console.log(id)
        const result = await query({query: "SELECT name, email, status FROM grace_user WHERE id = ?",
        values: [userId],});
    
        const user = result[0];
    
        return user;
      } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        return undefined;
      }
}

export const userRepository = {
    saveUser,
    findAllUsers,
    findByEmail,
    findByID
}