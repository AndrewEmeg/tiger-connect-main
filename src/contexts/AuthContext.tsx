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

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    studentId: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  verifyAccount: () => Promise<boolean>;
  makeUserAdmin: (engineeringCode: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("tigerUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("tigerUser");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await supabaseCon.login(email, password);
      if (user.success) {
        setCurrentUser(user.data);
        setIsAuthenticated(true);
        localStorage.setItem("tigerUser", JSON.stringify(user.data));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.data.first_name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    studentId: string,
    password: string
  ): Promise<boolean> => {
    try {
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");
      const signupResult = await supabaseCon.signup(
        firstName,
        lastName,
        email,
        studentId,
        password
      );

      if (!signupResult.success) return false;

      const newUser: User = {
        user_id: signupResult.data.user_id,
        first_name: signupResult.data.first_name,
        last_name: signupResult.data.last_name,
        email: signupResult.data.email,
        g_number: signupResult.data.g_number,
        rating: null,
        verified: signupResult.data.verified,
        joinedAt: signupResult.data.joinedAt,
      };

      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("tigerUser", JSON.stringify(newUser));

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please verify your student ID.",
      });

      return true;
    } catch (error) {
      console.error("Registration error", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyAccount = async (): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      const updatedUser = { ...currentUser, verified: true };
      setCurrentUser(updatedUser);
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
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("tigerUser");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const makeUserAdmin = async (engineeringCode: string): Promise<boolean> => {
    try {
      if (!currentUser?.user_id) {
        toast({
          title: "Error",
          description: "You must be logged in to become an admin",
          variant: "destructive",
        });
        return false;
      }

      if (engineeringCode !== "TigerConnect2024") {
        toast({
          title: "Invalid Code",
          description: "The engineering team code is incorrect",
          variant: "destructive",
        });
        return false;
      }

      const result = await supabaseCon.makeUserAdmin(currentUser.user_id);

      if (result.success) {
        const updatedUser = { ...currentUser, is_admin: true };
        setCurrentUser(updatedUser);
        localStorage.setItem("tigerUser", JSON.stringify(updatedUser));
        toast({
          title: "Admin Access Granted",
          description: "You now have administrator privileges",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to grant admin access",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        verifyAccount,
        makeUserAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
