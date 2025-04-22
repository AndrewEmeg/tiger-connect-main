import { supabaseCon } from "@/db_api/connection";

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    is_admin?: boolean;
    g_number?: string;
    verified?: boolean;
    rating?: number;
    bio?: string;
    avatar?: string;
    joinedAt?: Date;
}

export const mockUsers: User[] = [
    {
        user_id: "1",
        first_name: "John",
        last_name: "Smith",
        email: "jsmith@gram.edu",
        g_number: "G00123456",
        verified: true,
        avatar: "https://i.pravatar.cc/150?img=1",
        rating: 4.8,
        joinedAt: new Date(2023, 8, 1),
        bio: "Junior majoring in Computer Science. I love programming and basketball!",
        id: "1",
        created_at: "2023-08-01",
        updated_at: "2023-08-01",
    },
    {
        user_id: "2",
        first_name: "Taylor",
        last_name: "Johnson",
        email: "tjohnson@gram.edu",
        g_number: "G00789012",
        verified: true,
        avatar: "https://i.pravatar.cc/150?img=2",
        rating: 4.5,
        joinedAt: new Date(2022, 7, 15),
        bio: "Senior in Business Administration. Campus ambassador for several brands.",
        id: "2",
        created_at: "2022-07-15",
        updated_at: "2022-07-15",
    },
    {
        user_id: "3",
        first_name: "Alex",
        last_name: "Washington",
        email: "awash@gram.edu",
        g_number: "G00345678",
        verified: true,
        avatar: "https://i.pravatar.cc/150?img=3",
        rating: 4.9,
        joinedAt: new Date(2023, 1, 10),
        bio: "Sophomore studying Biology. Research assistant in the science department.",
        id: "3",
        created_at: "2023-01-10",
        updated_at: "2023-01-10",
    },
];

// Function to get mock users data
export const setUsers = async (): Promise<User[]> => {
    return mockUsers;
};
