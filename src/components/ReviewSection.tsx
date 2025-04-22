import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { Review } from "@/types/orders";
import { Rating } from "@/components/ui/rating";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

interface ReviewSectionProps {
    itemId: string;
    itemType: "product" | "service";
}

export const ReviewSection = ({ itemId, itemType }: ReviewSectionProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const { createReview, fetchItemReviews } = useReviews();
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: "",
    });
    const { user } = useAuth();

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user_id) {
            toast({
                title: "Error",
                description: "You must be logged in to leave a review",
                variant: "destructive",
            });
            return;
        }
        try {
            const review = await createReview({
                user_id: user.user_id,
                item_id: itemId,
                item_type: itemType,
                rating: newReview.rating,
                comment: newReview.comment,
            });
            setReviews((prev) => [review, ...prev]);
            setNewReview({ rating: 5, comment: "" });
        } catch (error) {
            console.error("Error creating review:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Reviews</h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
                <Rating
                    value={newReview.rating}
                    onChange={(value) =>
                        setNewReview((prev) => ({ ...prev, rating: value }))
                    }
                />
                <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                        setNewReview((prev) => ({
                            ...prev,
                            comment: e.target.value,
                        }))
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Write your review..."
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                    Submit Review
                </button>
            </form>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                        <Rating value={review.rating} readonly />
                        <p className="mt-2">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
