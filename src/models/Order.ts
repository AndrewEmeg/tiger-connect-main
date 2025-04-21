import { supabaseCon } from "@/db_api/connection";

export interface OrderItem {
    price: number;
    quantity: number;
    seller_id: string;
}

export interface Order {
    id: string;
    user_id: string;
    created_at: string;
    amount: number;
    status: string;
    items: OrderItem[];
}

export interface Review {
    id: string;
    order_id: string;
    user_id: string;
    item_id: string;
    item_type: "product" | "service";
    rating: number;
    comment: string;
    created_at: string;
}

// Fetch all orders for a specific user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
    const result = await supabaseCon.getUserOrders(userId);
    return result.data || [];
};

// Fetch all reviews for a specific item
export const getItemReviews = async (
    itemId: string,
    itemType: "product" | "service"
): Promise<Review[]> => {
    const result = await supabaseCon.getItemReviews(itemId, itemType);
    return result.data || [];
};

// Submit a new review
export const createReview = async (
    review: Omit<Review, "id" | "created_at" | "updated_at">
): Promise<Review | null> => {
    const result = await supabaseCon.createReview(review);
    return result.data || null;
};
