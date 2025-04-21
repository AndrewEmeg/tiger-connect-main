import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import {
    Calendar,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    Settings,
    Star,
    LogOut,
    VerifiedIcon,
    User,
    Clock,
} from "lucide-react";
import { setListings, MarketplaceItem } from "@/models/Marketplace";
import { Service, setServiceListings } from "@/models/Service";
import { useEffect, useState } from "react";
import OrderHistory from "@/components/OrderHistory";

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuth();
    const [marketListings, setNewMarketListings] = useState<MarketplaceItem[]>(
        []
    );
    const [serviceListings, setNewServiceListings] = useState<Service[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            const getlistings = await setListings();
            const getServices = await setServiceListings();
            setNewMarketListings(getlistings);
            setNewServiceListings(getServices);
        };

        fetchListings();
    }, []);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    // Filter listings and services for this user
    const userListings = marketListings.filter(
        (item) => item.seller_id === user?.user_id
    );
    const userServices = serviceListings.filter(
        (service) => service.provider_id === user?.user_id
    );

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Calculate account age
    const accountAge = () => {
        if (!user?.joinedAt) return "N/A";

        const now = new Date();
        const joinDate = new Date(user.joinedAt);
        const diffTime = Math.abs(now.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days`;
        } else {
            const diffMonths = Math.floor(diffDays / 30);
            return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
        }
    };

    return (
        <AppLayout title="Profile">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Info Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-grambling-gray flex items-center justify-center overflow-hidden">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={`${user.first_name} ${user.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-grambling-black/50" />
                                    )}
                                </div>
                                {user?.verified && (
                                    <div className="absolute bottom-0 right-0 bg-grambling-gold text-grambling-black rounded-full p-1">
                                        <VerifiedIcon className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center sm:text-left flex-1">
                                <div className="flex items-center justify-center sm:justify-start">
                                    <h1 className="text-xl font-semibold">
                                        {user?.first_name} {user?.last_name}
                                    </h1>
                                    {user?.verified && (
                                        <span className="ml-2 bg-grambling-gold/20 text-grambling-black text-xs px-2 py-1 rounded-full flex items-center">
                                            <VerifiedIcon className="h-3 w-3 mr-1" />
                                            Verified Student
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-center sm:justify-start mt-1">
                                    <Star className="h-4 w-4 text-grambling-gold fill-grambling-gold" />
                                    <span className="text-sm ml-1">
                                        {user?.rating || "No ratings yet"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-1">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Member since {accountAge()}
                                </div>

                                {user?.bio && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {user.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link to="/marketplace/new">
                        <Card className="h-24 tiger-card hover:border-grambling-gold transition-colors">
                            <CardContent className="flex flex-col items-center justify-center h-full p-3">
                                <ShoppingBag className="h-8 w-8 text-grambling-gold mb-1" />
                                <span className="text-xs font-medium">
                                    Sell Item
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/services/new">
                        <Card className="h-24 tiger-card hover:border-grambling-gold transition-colors">
                            <CardContent className="flex flex-col items-center justify-center h-full p-3">
                                <Briefcase className="h-8 w-8 text-grambling-gold mb-1" />
                                <span className="text-xs font-medium">
                                    Offer Service
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/messages">
                        <Card className="h-24 tiger-card hover:border-grambling-gold transition-colors">
                            <CardContent className="flex flex-col items-center justify-center h-full p-3">
                                <MessageSquare className="h-8 w-8 text-grambling-gold mb-1" />
                                <span className="text-xs font-medium">
                                    Messages
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/settings">
                        <Card className="h-24 tiger-card hover:border-grambling-gold transition-colors">
                            <CardContent className="flex flex-col items-center justify-center h-full p-3">
                                <Settings className="h-8 w-8 text-grambling-gold mb-1" />
                                <span className="text-xs font-medium">
                                    Settings
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Order History */}
                <OrderHistory />

                {/* Listings & Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Your Listings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Your Listings
                        </h2>
                        {userListings.length === 0 ? (
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-center text-gray-500">
                                        No listings yet
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {userListings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        to={`/product/${listing.id}`}
                                    >
                                        <Card className="hover:border-grambling-gold transition-colors">
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    ${listing.price}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Your Services */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Your Services
                        </h2>
                        {userServices.length === 0 ? (
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-center text-gray-500">
                                        No services yet
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {userServices.map((service) => (
                                    <Link
                                        key={service.id}
                                        to={`/services/${service.id}`}
                                    >
                                        <Card className="hover:border-grambling-gold transition-colors">
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold">
                                                    {service.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    ${service.rate}
                                                    {service.rateType ===
                                                    "hourly"
                                                        ? "/hr"
                                                        : ""}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="flex justify-center pt-6">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full max-w-xs"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
