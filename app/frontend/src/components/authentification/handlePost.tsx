import axios, { AxiosError, AxiosResponse } from 'axios';
import type { PostBody, CreatePostResponse } from '../../../../shared/types'

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

export const postData = async (data: PostBody): Promise<CreatePostResponse> => {
    try {
        console.log("sending:\n", data);
        const response: AxiosResponse = await axios.post<CreatePostResponse>('http://localhost:3000/auth/register', data);

        return response.data;
    } catch (error: any) {
        console.error("Couldn't create user:", error.message);
        throw error;
    }
};

// IN back end
//   async signUp(createUserDto: CreateUserDto): Promise< CreatePostResponse > {
//     createUserDto.password = await this.hashPassword(createUserDto.password);
//     const result: CreatePostResponse = await this.userService.create(createUserDto);
//     result.access_token = await this.createJWTToken(result.user)
//     return result;
//   }