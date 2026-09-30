import axios from 'axios';
import { PostBody } from '../../../../../shared/types'

type CreatePostResponse = PostBody & { id: number };

export const postData = async (data: PostBody): Promise<CreatePostResponse> => {
    const response = await axios.post<CreatePostResponse>("https://jsonplaceholder.typicode.com/posts", data);
    console.log("Response: \n" + response.data);
    return response.data;
};