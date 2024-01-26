export interface IUser {
    id?: number,
    name: string,
    email: string,
    avatar: string,
    isActive: boolean,
    details: any
}

export interface ICreateUserRequest {
    name: string, 
    email: string, 
    avatar: string, 
    details: any,
}

