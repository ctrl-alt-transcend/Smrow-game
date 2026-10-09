export type PostBody = {
    email: string;
    name: string;
    username: string;
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
