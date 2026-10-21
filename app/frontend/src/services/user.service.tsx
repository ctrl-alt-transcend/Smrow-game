import { http } from './http'
import type { AxiosResponse }  from 'axios';
import type { UserPublic } from "../../../shared/types";

export const getCurrentUser = async (): Promise<UserPublic> => {
    const res: AxiosResponse = await http.get<UserPublic>("/auth/me");
    return res.data;
};
