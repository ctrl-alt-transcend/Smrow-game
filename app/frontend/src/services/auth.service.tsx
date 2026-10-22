import axios, { type AxiosResponse } from 'axios';
import type { RegisterPost, LoginPost, RegisterResponse, LoginResponse } from '@shared/types';

export const registerUser = async (data: RegisterPost): Promise<RegisterResponse> => {
    try {
        const response: AxiosResponse = await axios.post<RegisterResponse>('/api/auth/register', data);
        localStorage.setItem("access_token", response.data.access_token);
        return response.data;
    } catch (error: any) {
        const err_msg = error.response?.data?.message;
        throw err_msg;
    }
};

export const loginUser = async (data: LoginPost): Promise<LoginResponse> => {
    try {
        const response: AxiosResponse = await axios.post<LoginResponse>('/api/auth/login', data);
        localStorage.setItem("access_token", response.data.access_token);
        return response.data;

    } catch (error: any) {
        const err_msg = error.response?.data?.message;
        throw err_msg;
    }
}
