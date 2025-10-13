export function setAuth(auth: { email: string }) {
    localStorage.setItem("auth", JSON.stringify(auth));
}

export function getAuth(): { email: string | null } {
    if (typeof window === "undefined") return { email: null };
    const data = localStorage.getItem("auth");
    return data ? JSON.parse(data) : { email: null };
}

export function clearAuth() {
    localStorage.removeItem("auth");
}
