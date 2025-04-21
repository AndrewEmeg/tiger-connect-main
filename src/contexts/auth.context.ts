import { createContext } from "react";
import { AuthContextType, defaultAuthContext } from "./AuthContext.types";

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
