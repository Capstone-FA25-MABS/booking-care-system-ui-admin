// src/types/user.types.ts

// ✅ Basic User Type
export interface User {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    role: 'patient' | 'doctor' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ✅ Login Credentials Type
export interface UserLogin {
    email: string;
    password: string;
}

// ✅ Register New User Type
export interface UserRegister {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}

// ✅ API Response Wrapper
export interface UserResponse {
    token: string;
    user: User;
}
