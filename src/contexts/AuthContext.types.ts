import { User } from "@/models/User"; // Import your custom User type

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (
        name: string,
        email: string,
        studentId: string,
        password: string
    ) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const defaultAuthContext: AuthContextType = {
    user: null,
    loading: true,
    isAuthenticated: false,
    login: async () => false,
    register: async () => false,
    logout: async () => {},
};
