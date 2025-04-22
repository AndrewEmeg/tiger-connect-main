import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Review } from "@/types/orders";

export const useReviews = () => {
    const createReview = useCallback(
        async (review: Omit<Review, "id" | "created_at" | "updated_at">) => {
            const { data, error } = await supabase
                .from("reviews")
                .insert(review)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        []
    );

    const fetchItemReviews = useCallback(
        async (itemId: string, itemType: "product" | "service") => {
            const { data, error } = await supabase
                .from("reviews")
                .select(
                    `
        *,
        users:user_id (
          id,
          full_name,
          avatar_url
        )
      `
                )
                .eq("item_id", itemId)
                .eq("item_type", itemType)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        []
    );

    return { createReview, fetchItemReviews };
};
