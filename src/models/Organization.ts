import { User } from "./User";

export interface PendingMember {
    id: string;
    user_id: string;
    organization_id: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    user: User;
    organization: Organization;
}

export interface Organization {
    id: string;
    name: string;
    type: string;
    description: string;
    created_at: string;
    updated_at: string;
    owner_id: string;
}
