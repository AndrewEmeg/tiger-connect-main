import { supabase } from "@/lib/supabaseClient";
import { User } from "@/models/User";

export const supabaseCon = {
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (data.user) {
            const userData: User = {
                user_id: data.user.id,
                first_name: data.user.user_metadata.first_name,
                last_name: data.user.user_metadata.last_name,
                email: data.user.email || "",
                g_number: data.user.user_metadata.g_number,
                rating: null,
                verified: data.user.user_metadata.verified || false,
                joinedAt: new Date(data.user.created_at),
            };
            return { success: true, data: userData, error: null };
        }
        return { success: false, data: null, error: error?.message };
    },

    async signup(
        firstName: string,
        lastName: string,
        email: string,
        studentId: string,
        password: string
    ) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    g_number: studentId,
                },
            },
        });
        if (data.user) {
            const userData: User = {
                user_id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                g_number: studentId,
                rating: null,
                verified: false,
                joinedAt: new Date(),
            };
            return { success: true, data: userData, error: null };
        }
        return { success: false, data: null, error: error?.message };
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        return { success: !error, error: error?.message };
    },

    async makeUserAdmin(userId: string) {
        const { data, error } = await supabase
            .from("user_table")
            .update({ is_admin: true })
            .eq("user_id", userId);
        return { success: !error, data, error: error?.message };
    },

    async getUserOrganizations(userId: string) {
        const { data, error } = await supabase
            .from("organization_members")
            .select("organization_id, organizations(*)")
            .eq("user_id", userId);
        return { success: !error, data, error: error?.message };
    },

    async getOrganizations() {
        const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .order("created_at", { ascending: false });
        return { success: !error, data, error: error?.message };
    },
};
