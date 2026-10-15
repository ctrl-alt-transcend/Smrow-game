import axios from 'axios';
import type { UserPublic } from "../../../shared/types";

export const getCurrentUser = async (): Promise<UserPublic> => {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Not authenticated");
    const response = await axios.get<UserPublic>("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};