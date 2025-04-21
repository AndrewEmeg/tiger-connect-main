export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    payment_intent_id: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    item_id: string;
    item_type: "product" | "service";
    quantity: number;
    price_at_time: number;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    item_id: string;
    item_type: "product" | "service";
    rating: number;
    comment?: string;
    created_at: string;
    updated_at: string;
}
