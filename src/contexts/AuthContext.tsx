import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import { User } from "@/models/User";
import { useToast } from "@/hooks/use-toast";
import { supabaseCon } from "@/db_api/connection.js";
import { supabase } from "@/lib/supabaseClient";
import { AuthContextType, defaultAuthContext } from "./AuthContext.types";
import { AuthContext } from "./auth.context";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    user_id: session.user.id,
                    first_name: session.user.user_metadata?.first_name || "",
                    last_name: session.user.user_metadata?.last_name || "",
                    email: session.user.email || "",
                    g_number: session.user.user_metadata?.g_number || "",
                    rating: null,
                    verified: session.user.user_metadata?.verified || false,
                    joinedAt: new Date(session.user.created_at),
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    user_id: session.user.id,
                    first_name: session.user.user_metadata?.first_name || "",
                    last_name: session.user.user_metadata?.last_name || "",
                    email: session.user.email || "",
                    g_number: session.user.user_metadata?.g_number || "",
                    rating: null,
                    verified: session.user.user_metadata?.verified || false,
                    joinedAt: new Date(session.user.created_at),
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const result = await supabaseCon.login(email, password);
            if (result.success && result.data) {
                const userData: User = {
                    user_id: result.data.user_id,
                    first_name: result.data.first_name,
                    last_name: result.data.last_name,
                    email: result.data.email,
                    g_number: result.data.g_number,
                    verified: result.data.verified,
                    rating: 0, // Default value since it's not in the response
                    joinedAt: result.data.joinedAt,
                };
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const register = async (
        name: string,
        email: string,
        studentId: string,
        password: string
    ) => {
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ");
        const result = await supabaseCon.signup(
            firstName,
            lastName,
            email,
            studentId,
            password
        );
        return result.success;
    };

    const verifyAccount = async (): Promise<boolean> => {
        // Simulate API call for verification
        try {
            if (!user) return false;

            // In a real app, this would call your verification API
            const updatedUser = { ...user, verified: true };
            setUser(updatedUser);
            localStorage.setItem("tigerUser", JSON.stringify(updatedUser));

            toast({
                title: "Verification Successful",
                description: "Your student ID has been verified!",
            });

            return true;
        } catch (error) {
            console.error("Verification error", error);
            toast({
                title: "Verification Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
            return false;
        }
    };

    const logout = async () => {
        const logoutResult = await supabaseCon.logout();
        if (!logoutResult.success) {
            toast({
                title: "Logout Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
            return;
        }
        setUser(null);
        localStorage.removeItem("tigerUser");
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
