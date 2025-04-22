import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Order } from "../models/Order";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function OrderHistory() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const loadOrders = useCallback(async () => {
        if (!currentUser?.user_id) {
            console.log("No user ID found:", currentUser);
            return;
        }

        console.log(
            "Attempting to fetch orders for user_id:",
            currentUser.user_id
        );
        setLoading(true);

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", currentUser.user_id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
            console.log(
                "Current auth status:",
                await supabase.auth.getSession()
            );
            toast.error("Could not load orders.");
        } else {
            console.log("Orders fetched successfully:", data);
            setOrders(data as Order[]);
        }

        setLoading(false);
    }, [currentUser?.user_id]);

    useEffect(() => {
        const checkAuthAndLoadOrders = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            console.log("Current auth session:", session?.user?.id);
            console.log("Component user_id:", currentUser?.user_id);

            if (session?.user?.id !== currentUser?.user_id) {
                console.warn("Auth session and user ID mismatch!");
            }

            loadOrders();
        };

        checkAuthAndLoadOrders();
    }, [loadOrders]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !currentUser) return;

        const { error } = await supabase.from("reviews").insert({
            order_id: selectedOrder.id,
            user_id: currentUser.user_id,
            rating,
            comment,
        });

        if (error) {
            console.error(error);
            toast.error("Failed to submit review");
        } else {
            toast.success("Review submitted");
            setSelectedOrder(null);
            setRating(5);
            setComment("");
        }
    };

    if (loading) return <div className="text-center">Loading orders...</div>;

    if (orders.length === 0)
        return (
            <div className="text-center text-gray-500">
                No orders found. Start shopping to see your order history!
            </div>
        );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>
            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white rounded-lg shadow p-4 space-y-2"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">
                                    Order #{order.id.slice(0, 6)}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(
                                        order.created_at
                                    ).toLocaleDateString()}
                                </p>
                                <ul className="text-sm list-disc list-inside mt-1 text-gray-700">
                                    {(order.items || []).map((item, i) => (
                                        <li key={i}>
                                            {item.quantity} × ${item.price}{" "}
                                            (Seller:{" "}
                                            <code>
                                                {item.seller_id.slice(0, 6)}...
                                            </code>
                                            )
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm">
                                    Total: <strong>${order.amount}</strong>
                                </p>
                                <p className="text-sm">
                                    Status:{" "}
                                    <span
                                        className={`${
                                            order.status === "completed"
                                                ? "text-green-600"
                                                : order.status === "cancelled"
                                                ? "text-red-600"
                                                : "text-yellow-600"
                                        }`}
                                    >
                                        {order.status.charAt(0).toUpperCase() +
                                            order.status.slice(1)}
                                    </span>
                                </p>
                            </div>
                            {order.status === "completed" && (
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedOrder && (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rating
                        </label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300"
                        >
                            {[1, 2, 3, 4, 5].map((val) => (
                                <option key={val} value={val}>
                                    {val} {val === 1 ? "star" : "stars"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Comment
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300"
                            placeholder="Share your experience..."
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="px-4 py-2 text-sm bg-gray-100 border rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
