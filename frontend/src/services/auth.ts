import { apiFetch } from "./api";

interface LoginPayload {
    email: string;
    password: string;
    remember: boolean;
}

export async function login(data: LoginPayload) {
    return apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function logout() {
    return apiFetch("/api/logout", {
        method: "POST",
    });
}