import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Order, OrderItem } from "@/types/orders";

export const useOrders = () => {
    const fetchUserOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from("orders")
            .select(
                `
        *,
        order_items (
          *,
          products:item_id (*),
          services:item_id (*)
        )
      `
            )
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    }, []);

    return { fetchUserOrders };
};
