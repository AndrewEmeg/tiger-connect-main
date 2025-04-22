import { supabase } from "@/lib/supabaseClient";
import { User } from "@/models/User";

interface UserSettings {
    email?: string;
    first_name?: string;
    last_name?: string;
    g_number?: string;
    avatar?: string;
    bio?: string;
    verified?: boolean;
    email_notifications?: boolean;
    message_sound?: boolean;
}

export const supabaseCon = {
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (data.user) {
            // First get the user's profile data from user_table
            const { data: userData, error: userError } = await supabase
                .from("user_table")
                .select("*")
                .eq("user_id", data.user.id)
                .single();

            if (userError) {
                return { success: false, data: null, error: userError.message };
            }

            const user: User = {
                user_id: data.user.id,
                id: data.user.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: data.user.email || "",
                g_number: userData.g_number,
                rating: userData.rating,
                verified: userData.verified || false,
                joinedAt: new Date(data.user.created_at),
                created_at: data.user.created_at,
                updated_at: data.user.created_at,
                bio: userData.bio,
                avatar: userData.avatar,
                is_admin: userData.is_admin,
            };
            return { success: true, data: user, error: null };
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
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                g_number: studentId,
                rating: null,
                verified: false,
                joinedAt: new Date(),
                created_at: data.user.created_at,
                updated_at: data.user.created_at,
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

    async createOrganization(
        name: string,
        type: string,
        description: string,
        userId: string
    ) {
        const { data, error } = await supabase
            .from("organizations")
            .insert({ name, type, description, creator_id: userId })
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async joinOrganization(userId: string, organizationId: string) {
        const { data, error } = await supabase
            .from("organization_members")
            .insert({ user_id: userId, organization_id: organizationId })
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async getEvents() {
        const { data, error } = await supabase
            .from("events")
            .select(
                `
                *,
                organization:organizations(*),
                creator:user_table(first_name, last_name)
            `
            )
            .order("date", { ascending: true });
        return { success: !error, data, error: error?.message };
    },

    async canUserCreateEvents(userId: string) {
        const { data, error } = await supabase
            .from("organization_members")
            .select("organizations(*)")
            .eq("user_id", userId)
            .eq("verified", true);
        return {
            success: !error,
            canCreate: data && data.length > 0,
            organizations: data,
            error: error?.message,
        };
    },

    async checkSellerStatus(userId: string) {
        if (!userId) return { success: false, error: "No user ID provided" };
        const { data, error } = await supabase
            .from("user_table")
            .select("verified")
            .eq("user_id", userId)
            .single();
        return {
            success: !error,
            data: data?.verified || false,
            error: error?.message,
        };
    },

    async listItemsToMarketPlace(
        title: string,
        description: string,
        price: number,
        sellerId: string,
        condition: string,
        category: string,
        images: string[]
    ) {
        const { data, error } = await supabase
            .from("marketplace_listings")
            .insert({
                title,
                description,
                price,
                seller_id: sellerId,
                condition,
                category,
                images,
            })
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async createNewListingNotification(
        userId: string,
        itemId: string,
        itemTitle: string
    ) {
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                user_id: userId,
                type: "new_listing",
                content: `Your item "${itemTitle}" has been listed`,
                reference_id: itemId,
            })
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async listServices(
        title: string,
        description: string,
        rate: number,
        rateType: string,
        category: string,
        providerId: string,
        availability: string[],
        image?: string
    ) {
        const { data, error } = await supabase
            .from("services_table")
            .insert({
                title,
                description,
                rate,
                rateType,
                category,
                provider_id: providerId,
                availability,
                image,
            })
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async createNewServiceNotification(
        userId: string,
        serviceId: string,
        serviceTitle: string
    ) {
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                user_id: userId,
                type: "new_service",
                content: `Your service "${serviceTitle}" has been listed`,
                reference_id: serviceId,
            })
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async getPendingOrganizations() {
        const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });
        return { success: !error, data, error: error?.message };
    },

    async approveOrganization(orgId: string) {
        const { data, error } = await supabase
            .from("organizations")
            .update({ status: "approved" })
            .eq("id", orgId)
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async rejectOrganization(orgId: string) {
        const { data, error } = await supabase
            .from("organizations")
            .update({ status: "rejected" })
            .eq("id", orgId)
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async getPendingMembersForAdmin(userId: string) {
        const { data, error } = await supabase
            .from("organization_members")
            .select(
                `
                *,
                users:user_table(first_name, last_name),
                organizations(name, type)
            `
            )
            .eq("status", "pending")
            .eq("organizations.admin_id", userId);
        return { success: !error, data, error: error?.message };
    },

    async approveOrganizationMember(memberId: string, organizationId: string) {
        const { data, error } = await supabase
            .from("organization_members")
            .update({ status: "approved" })
            .eq("user_id", memberId)
            .eq("organization_id", organizationId)
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async updateSettings(userId: string, settings: UserSettings) {
        const { data, error } = await supabase
            .from("user_table")
            .update(settings)
            .eq("user_id", userId)
            .select()
            .single();
        return { success: !error, data, error: error?.message };
    },

    async updatePassword(userId: string, newPassword: string) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        return { success: !error, data, error: error?.message };
    },

    async enableMFA(userId: string, email: string) {
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: "totp",
        });
        return { success: !error, data, error: error?.message };
    },

    async getUnreadNotificationCount(userId: string) {
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .eq("read", false);
        return { success: !error, count, error: error?.message };
    },
};
