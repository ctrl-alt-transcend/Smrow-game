import  { http } from './http'
import type {AxiosResponse } from 'axios'
import type { RegisterPost, LoginPost, RegisterResponse, LoginResponse } from '@shared/types'

export const registerUser = async (data: RegisterPost): Promise<RegisterResponse> => {
    try {
        const res: AxiosResponse = await http.post<RegisterResponse>('/auth/register', data);
        return res.data;
    } catch (error: any) {
        const err_msg = error.response?.data?.message;
        throw err_msg;
    }
};

export const loginUser = async (data: LoginPost): Promise<LoginResponse> => {
    try {
        const res: AxiosResponse = await http.post<LoginResponse>('/auth/login', data);
        return res.data;

    } catch (error: any) {
        const err_msg = error.response?.data?.message;
        throw err_msg;
    }
}
