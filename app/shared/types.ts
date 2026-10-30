export type RegisterPost = {
    username: string;
    name: string;
    email: string;
    password: string;
};

export type LoginPost = {
    email: string;
    password: string;
}

export type UserPublic = {
    id: string;
    name: string;
    email: string;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    username: string;
    createdAt: string;
    bio: string | null;
    avatarURL: string | null;
};

export type RegisterResponse = {
    message: string;
    user: UserPublic;
    access_token: string;
};

export type LoginResponse = {
    access_token: string;
}

// Payload

export interface JwtPayload {
    sub: string;
    username: string;
}
