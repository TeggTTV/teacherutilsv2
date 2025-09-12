export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    school?: string;
    grade?: string;
    subject?: string;
    bio?: string;
    profileImage?: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
