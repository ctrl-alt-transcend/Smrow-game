import axios from 'axios';

// type PostBody = {
//     userId: number;
//     id: number;
//     email: string;
//     pass: string;
//     username: string;
// };

type CreatePostResponse = PostBody & { id: number };

export const postData = async (data: PostBody): Promise<CreatePostResponse> => {
    const response = await axios.post<CreatePostResponse>("https://jsonplaceholder.typicode.com/posts", data);
    console.log("Response: \n" + response.data);
    response.data.terms === true ? console.log("User already exist") : console.log("User created");
    return response.data;
};