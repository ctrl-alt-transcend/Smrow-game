import axios from 'axios';
import { PostBody, UserPublic, CreatePostResponse } from '../../../../../shared/types'

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
    const response = await axios.post<CreatePostResponse>("https://jsonplaceholder.typicode.com/posts", data);
    if (response.status == 400)
        console.log("error");
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    // console.log("Created user with ID: ", user.id);
    return response.data;
};