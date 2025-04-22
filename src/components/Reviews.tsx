import { useEffect, useState } from "react";
import { Review, getItemReviews } from "@/models/Order";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewsProps {
    itemId: string;
    itemType: "product" | "service";
}

interface ReviewWithUser extends Review {
    user: {
        first_name: string;
        last_name: string;
        avatar?: string;
    };
}

export function Reviews({ itemId, itemType }: ReviewsProps) {
    const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, [itemId, itemType]);

    const loadReviews = async () => {
        try {
            const itemReviews = await getItemReviews(itemId, itemType);
            setReviews(itemReviews as ReviewWithUser[]);
        } catch (error) {
            console.error("Error loading reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return <div className="text-center py-4">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-gray-500">No reviews yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-bold">
                    {reviews.reduce((acc, review) => acc + review.rating, 0) /
                        reviews.length}
                </div>
                <div>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${
                                    star <=
                                    reviews.reduce(
                                        (acc, review) => acc + review.rating,
                                        0
                                    ) /
                                        reviews.length
                                        ? "text-grambling-gold fill-grambling-gold"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">
                        {reviews.length} reviews
                    </p>
                </div>
            </div>

            {reviews.map((review) => (
                <Card
                    key={review.id}
                    className="hover:border-grambling-gold transition-colors"
                >
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback>
                                    {review.user.first_name[0]}
                                    {review.user.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        {review.user.first_name}{" "}
                                        {review.user.last_name}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(review.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                                star <= review.rating
                                                    ? "text-grambling-gold fill-grambling-gold"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                {review.comment && (
                                    <p className="mt-2 text-gray-600">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
