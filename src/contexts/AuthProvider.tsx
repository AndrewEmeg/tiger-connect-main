import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.context";
import { User } from "@/models/User";
import { supabase } from "@/lib/supabaseClient";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // ... your existing AuthProvider implementation
};
