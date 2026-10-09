import axios, { type AxiosResponse } from 'axios';
import type { RegisterPost, LoginPost, RegisterResponse, LoginResponse } from '../../../../shared/types'

// Response Example
// {
//   "message": "Utilisateur créé avec succès",
//   "user": {
//     "id": 105,
//     "name": "Théo",
//     "email": "theo@example.com"
//     // Le mot de passe NE DOIT JAMAIS être présent ici
//   },
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNX0..."
// }

export const createUser = async (data: RegisterPost): Promise<RegisterResponse> => {
    try {
        console.log("sending:\n", data);
        const response: AxiosResponse = await axios.post<RegisterResponse>('http://localhost:3000/auth/register', data);

        console.log("recieved: ", response.data);
        localStorage.setItem("access_token", response.data.access_token);
        return response.data;
    } catch (error: any) {
        console.error("Couldn't create user:", error.message);
        throw error;
    }
};

export const loginPost = async (data: LoginPost): Promise<LoginResponse> => {
    try {
        console.log("Sending: ", data);
        const response: AxiosResponse = await axios.post<LoginResponse>('http://localhost:3000/auth/login', data);
        console.log("access_token", response.data.access_token);
        return response.data;

    } catch (error: any) {
        console.error("You are dumb", error.message);
        throw error;
    }
}

// IN back end
//   async signUp(createUserDto: CreateUserDto): Promise< CreatePostResponse > {
//     createUserDto.password = await this.hashPassword(createUserDto.password);
//     const result: CreatePostResponse = await this.userService.create(createUserDto);
//     result.access_token = await this.createJWTToken(result.user)
//     return result;
//   }
