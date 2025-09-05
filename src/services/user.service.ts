// src/services/user.service.ts
import axios from 'axios';
import { User, UserLogin, UserRegister, UserResponse } from '../types/user.type.js';

const API_URL = 'https://your-api-domain.com/api/users';

export const userService = {
    login,
    register,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
};

async function login(data: UserLogin): Promise<UserResponse> {
    const response = await axios.post<UserResponse>(`${API_URL}/login`, data);
    return response.data;
}

async function register(data: UserRegister): Promise<UserResponse> {
    const response = await axios.post<UserResponse>(`${API_URL}/register`, data);
    return response.data;
}

async function getUserProfile(token: string): Promise<User> {
    const response = await axios.get<User>(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

async function updateUserProfile(token: string, updates: Partial<User>): Promise<User> {
    const response = await axios.put<User>(`${API_URL}/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

async function getAllUsers(token: string): Promise<User[]> {
    const response = await axios.get<User[]>(`${API_URL}/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}
