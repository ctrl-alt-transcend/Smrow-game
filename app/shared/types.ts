export type PostBody = {
    username: string;
    name: string;
    email: string;
    password: string;
};

export type UserPublic = {
    id: number;
    name: string;
    email: string;
};

export type CreatePostResponse = {
    message: string;
    user: UserPublic;
    access_token: string;
};
