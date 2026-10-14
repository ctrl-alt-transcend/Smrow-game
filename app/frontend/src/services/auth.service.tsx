import axios, { type AxiosResponse } from 'axios';
import type { RegisterPost, LoginPost, RegisterResponse, LoginResponse } from '../../shared/types'

export const registerUser = async (data: RegisterPost): Promise<RegisterResponse> => {
    try {
        const response: AxiosResponse = await axios.post<RegisterResponse>('http://localhost:3000/auth/register', data);
        localStorage.setItem("access_token", response.data.access_token);
        console.log("Returning: ", response);
        return response.data;
    } catch (error: any) {
        console.log("Couldn't create user:", error.code);
        throw error;
    }
};

export const loginUser = async (data: LoginPost): Promise<LoginResponse> => {
    try {
        const response: AxiosResponse = await axios.post<LoginResponse>('http://localhost:3000/auth/login', data);
        localStorage.setItem("access_token", response.data.access_token);
        console.log("Returning: ", response);
        return response.data;

    } catch (error: any) {
        console.error("Can't login", error.message);
        throw error;
    }
}