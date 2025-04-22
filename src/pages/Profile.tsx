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
    Users,
    Plus,
    Building,
    InfoIcon,
} from "lucide-react";
import { setListings, MarketplaceItem } from "@/models/Marketplace";
import { Service, setServiceListings } from "@/models/Service";
import { useEffect, useState } from "react";
import { supabaseCon } from "@/db_api/connection";
import OrderHistory from "@/components/OrderHistory";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { organizationTypeNames } from "@/models/Event";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import {
    AdminPendingOrganizations,
    AdminPendingMembers,
} from "@/components/admin-pending-organizations";
import { Label } from "@/components/ui/label";

export default function Profile() {
    const { currentUser, isAuthenticated, logout, makeUserAdmin } = useAuth();
    const [marketListings, setNewMarketListings] = useState<MarketplaceItem[]>(
        []
    );
    const [serviceListings, setNewServiceListings] = useState<Service[]>([]);
    const [userOrganizations, setUserOrganizations] = useState([]);
    const [allOrganizations, setAllOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [createOrgOpen, setCreateOrgOpen] = useState(false);
    const [joinOrgOpen, setJoinOrgOpen] = useState(false);
    const navigate = useNavigate();

    const createOrgSchema = z.object({
        name: z
            .string()
            .min(3, "Organization name must be at least 3 characters"),
        type: z.enum(["admin_faculty", "official_student", "general"], {
            required_error: "Please select an organization type",
        }),
        description: z
            .string()
            .min(10, "Description must be at least 10 characters"),
    });

    const joinOrgSchema = z.object({
        organization_id: z.string({
            required_error: "Please select an organization",
        }),
    });

    const createOrgForm = useForm<z.infer<typeof createOrgSchema>>({
        resolver: zodResolver(createOrgSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const joinOrgForm = useForm<z.infer<typeof joinOrgSchema>>({
        resolver: zodResolver(joinOrgSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            // Fetch listings
            const getlistings = await setListings();
            const getServices = await setServiceListings();
            setNewMarketListings(getlistings);
            setNewServiceListings(getServices);

            // Fetch organizations if user exists
            if (currentUser?.user_id) {
                const userOrgsResult = await supabaseCon.getUserOrganizations(
                    currentUser.user_id
                );
                if (userOrgsResult.success) {
                    setUserOrganizations(userOrgsResult.data || []);
                }

                const allOrgsResult = await supabaseCon.getOrganizations();
                if (allOrgsResult.success) {
                    setAllOrganizations(allOrgsResult.data || []);
                }
            }
        };

        fetchData();
    }, [currentUser]);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    // Filter listings and services for this user
    const userListings = marketListings.filter(
        (item) => item.seller_id === currentUser?.user_id
    );
    const userServices = serviceListings.filter(
        (service) => service.provider_id === currentUser?.user_id
    );

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Calculate account age
    const accountAge = () => {
        if (!currentUser?.joinedAt) return "N/A";

        const now = new Date();
        const joinDate = new Date(currentUser.joinedAt);
        const diffTime = Math.abs(now.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} days`;
        } else {
            const diffMonths = Math.floor(diffDays / 30);
            return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
        }
    };

    const onCreateOrgSubmit = async (
        values: z.infer<typeof createOrgSchema>
    ) => {
        setIsLoading(true);

        try {
            const result = await supabaseCon.createOrganization(
                values.name,
                values.type,
                values.description,
                currentUser.user_id
            );

            if (result.success) {
                toast.success("Organization created successfully");
                const userOrgsResult = await supabaseCon.getUserOrganizations(
                    currentUser.user_id
                );
                if (userOrgsResult.success) {
                    setUserOrganizations(userOrgsResult.data || []);
                }
                setCreateOrgOpen(false);
                createOrgForm.reset();
            } else {
                toast.error("Failed to create organization: " + result.error);
            }
        } catch (error) {
            console.error("Error creating organization:", error);
            toast.error("Failed to create organization");
        } finally {
            setIsLoading(false);
        }
    };

    const onJoinOrgSubmit = async (values: z.infer<typeof joinOrgSchema>) => {
        setIsLoading(true);

        try {
            const isMember = userOrganizations.some(
                (org) => org.organization_id === values.organization_id
            );

            if (isMember) {
                toast.error("You are already a member of this organization");
                setJoinOrgOpen(false);
                return;
            }

            const result = await supabaseCon.joinOrganization(
                currentUser.user_id,
                values.organization_id
            );

            if (result.success) {
                toast.success("Request to join organization sent successfully");
                const userOrgsResult = await supabaseCon.getUserOrganizations(
                    currentUser.user_id
                );
                if (userOrgsResult.success) {
                    setUserOrganizations(userOrgsResult.data || []);
                }
                setJoinOrgOpen(false);
                joinOrgForm.reset();
            } else {
                toast.error("Failed to join organization: " + result.error);
            }
        } catch (error) {
            console.error("Error joining organization:", error);
            toast.error("Failed to join organization");
        } finally {
            setIsLoading(false);
        }
    };

    const getOrgTypeBadge = (type) => {
        switch (type) {
            case "admin_faculty":
                return <Badge variant="destructive">Faculty/Admin</Badge>;
            case "official_student":
                return (
                    <Badge
                        variant="default"
                        className="bg-grambling-gold text-black"
                    >
                        Official Organization
                    </Badge>
                );
            case "general":
                return <Badge variant="outline">Club/Group</Badge>;
            default:
                return null;
        }
    };

    return (
        <AppLayout title="Profile">
            <div className="space-y-6">
                {/* Profile Header */}
                <Card className="tiger-card">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-grambling-gray flex items-center justify-center overflow-hidden">
                                    {currentUser?.avatar ? (
                                        <img
                                            src={currentUser.avatar}
                                            alt={
                                                currentUser.first_name +
                                                " " +
                                                currentUser.last_name
                                            }
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-grambling-black/50" />
                                    )}
                                </div>
                                {currentUser?.verified && (
                                    <div className="absolute bottom-0 right-0 bg-grambling-gold text-grambling-black rounded-full p-1">
                                        <VerifiedIcon className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center sm:text-left flex-1">
                                <div className="flex items-center justify-center sm:justify-start">
                                    <h1 className="text-xl font-semibold">
                                        {currentUser?.first_name}{" "}
                                        {currentUser?.last_name}
                                    </h1>
                                    {currentUser?.verified && (
                                        <span className="ml-2 bg-grambling-gold/20 text-grambling-black text-xs px-2 py-1 rounded-full flex items-center">
                                            <VerifiedIcon className="h-3 w-3 mr-1" />
                                            Verified Student
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-center sm:justify-start mt-1">
                                    <Star className="h-4 w-4 text-grambling-gold fill-grambling-gold" />
                                    <span className="text-sm ml-1">
                                        {currentUser?.rating ||
                                            "No ratings yet"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-1">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Member since {accountAge()}
                                </div>

                                {currentUser?.bio && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {currentUser.bio}
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

                {/* My Organizations */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">
                            My Organizations
                        </h2>
                        <div className="flex gap-2">
                            <Dialog
                                open={joinOrgOpen}
                                onOpenChange={setJoinOrgOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Users className="h-4 w-4 mr-1" />
                                        Join Existing
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Join an Organization
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select an organization to request
                                            membership
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form {...joinOrgForm}>
                                        <form
                                            onSubmit={joinOrgForm.handleSubmit(
                                                onJoinOrgSubmit
                                            )}
                                            className="space-y-4"
                                        >
                                            <FormField
                                                control={joinOrgForm.control}
                                                name="organization_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Organization
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select an organization" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {allOrganizations.length ===
                                                                0 ? (
                                                                    <div className="p-2 text-center text-gray-500">
                                                                        <p>
                                                                            No
                                                                            organizations
                                                                            available
                                                                            to
                                                                            join
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="p-2 text-xs text-gray-500 border-b">
                                                                            Organizations
                                                                            must
                                                                            be
                                                                            verified
                                                                            by
                                                                            an
                                                                            admin
                                                                            before
                                                                            becoming
                                                                            fully
                                                                            active.
                                                                        </div>

                                                                        {allOrganizations
                                                                            .filter(
                                                                                (
                                                                                    org
                                                                                ) =>
                                                                                    !userOrganizations.some(
                                                                                        (
                                                                                            userOrg
                                                                                        ) =>
                                                                                            userOrg.organization_id ===
                                                                                            org.id
                                                                                    )
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    org
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            org.id
                                                                                        }
                                                                                        value={
                                                                                            org.id
                                                                                        }
                                                                                    >
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span>
                                                                                                {
                                                                                                    org.name
                                                                                                }
                                                                                            </span>
                                                                                            {getOrgTypeBadge(
                                                                                                org.type
                                                                                            )}
                                                                                            {!org.verified && (
                                                                                                <Badge
                                                                                                    variant="outline"
                                                                                                    className="ml-1 text-xs px-1 py-0 h-5 bg-yellow-50 text-yellow-800 border-yellow-200"
                                                                                                >
                                                                                                    Pending
                                                                                                </Badge>
                                                                                            )}
                                                                                            {org.verified && (
                                                                                                <Badge
                                                                                                    variant="outline"
                                                                                                    className="ml-1 text-xs px-1 py-0 h-5 bg-green-50 text-green-800 border-green-200"
                                                                                                >
                                                                                                    Verified
                                                                                                </Badge>
                                                                                            )}
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                )
                                                                            )}

                                                                        {allOrganizations.length >
                                                                            0 &&
                                                                            allOrganizations.filter(
                                                                                (
                                                                                    org
                                                                                ) =>
                                                                                    !userOrganizations.some(
                                                                                        (
                                                                                            userOrg
                                                                                        ) =>
                                                                                            userOrg.organization_id ===
                                                                                            org.id
                                                                                    )
                                                                            )
                                                                                .length ===
                                                                                0 && (
                                                                                <div className="p-2 text-center text-gray-500">
                                                                                    <p>
                                                                                        You're
                                                                                        already
                                                                                        a
                                                                                        member
                                                                                        of
                                                                                        all
                                                                                        available
                                                                                        organizations
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                    </>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            Your request will
                                                            need to be approved
                                                            by an organization
                                                            admin.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setJoinOrgOpen(false)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading
                                                        ? "Submitting..."
                                                        : "Submit Request"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>

                            <Dialog
                                open={createOrgOpen}
                                onOpenChange={setCreateOrgOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="bg-grambling-gold text-black hover:bg-grambling-gold/90"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Create New
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create New Organization
                                        </DialogTitle>
                                        <DialogDescription>
                                            Fill in the details to create a new
                                            campus organization
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form {...createOrgForm}>
                                        <form
                                            onSubmit={createOrgForm.handleSubmit(
                                                onCreateOrgSubmit
                                            )}
                                            className="space-y-4"
                                        >
                                            <FormField
                                                control={createOrgForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Organization Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter organization name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={createOrgForm.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Organization Type
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select organization type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="admin_faculty">
                                                                    Faculty/Admin
                                                                </SelectItem>
                                                                <SelectItem value="official_student">
                                                                    Official
                                                                    Student
                                                                    Organization
                                                                </SelectItem>
                                                                <SelectItem value="general">
                                                                    Club/Group
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            Note: New
                                                            organizations need
                                                            to be verified by an
                                                            admin
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={createOrgForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Enter organization description"
                                                                className="min-h-[100px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setCreateOrgOpen(false)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading
                                                        ? "Creating..."
                                                        : "Create Organization"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {userOrganizations.length > 0 ? (
                        <div className="space-y-3">
                            {userOrganizations.map((membership) => (
                                <Card
                                    key={membership.organization_id}
                                    className="tiger-card"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {
                                                            membership
                                                                .organizations
                                                                ?.name
                                                        }
                                                    </h3>
                                                    {getOrgTypeBadge(
                                                        membership.organizations
                                                            ?.type
                                                    )}
                                                    {membership.role ===
                                                        "admin" && (
                                                        <Badge variant="secondary">
                                                            Admin
                                                        </Badge>
                                                    )}
                                                    {!membership.verified && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-orange-100 text-orange-800 border-orange-200"
                                                        >
                                                            Pending Approval
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {membership.organizations
                                                        ?.description ||
                                                        "No description available"}
                                                </p>
                                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                                    <Building className="h-3 w-3 mr-1" />
                                                    Status:{" "}
                                                    {membership.organizations
                                                        ?.verified
                                                        ? "Verified"
                                                        : "Awaiting Verification"}
                                                </div>
                                            </div>
                                            <div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="tiger-card bg-gray-50">
                            <CardContent className="p-8 text-center">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-500 mb-2">
                                    No Organizations Yet
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Join existing organizations or create your
                                    own
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => setJoinOrgOpen(true)}
                                    >
                                        Join Existing
                                    </Button>
                                    <Button
                                        className="bg-grambling-gold hover:bg-grambling-gold/90 text-grambling-black"
                                        onClick={() => setCreateOrgOpen(true)}
                                    >
                                        Create Organization
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* My Listings */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">My Listings</h2>
                        <Link
                            to="/marketplace/new"
                            className="text-grambling-gold text-sm"
                        >
                            + Add New
                        </Link>
                    </div>

                    {userListings.length > 0 ? (
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
                    ) : (
                        <Card className="tiger-card bg-gray-50">
                            <CardContent className="p-8 text-center">
                                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-500 mb-2">
                                    No Listings Yet
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Start selling items to the Grambling
                                    community
                                </p>
                                <Link to="/marketplace/new">
                                    <Button className="bg-grambling-gold hover:bg-grambling-gold/90 text-grambling-black">
                                        Create Listing
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* My Services */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">My Services</h2>
                        <Link
                            to="/services/new"
                            className="text-grambling-gold text-sm"
                        >
                            + Add New
                        </Link>
                    </div>

                    {userServices.length > 0 ? (
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
                                                {service.rateType === "hourly"
                                                    ? "/hr"
                                                    : ""}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="tiger-card bg-gray-50">
                            <CardContent className="p-8 text-center">
                                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-500 mb-2">
                                    No Services Yet
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Share your skills with the Grambling
                                    community
                                </p>
                                <Link to="/services/new">
                                    <Button className="bg-grambling-gold hover:bg-grambling-gold/90 text-grambling-black">
                                        Create Service
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Admin Panel */}
                {currentUser?.is_admin && (
                    <section className="mt-6">
                        <Card className="tiger-card">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        Admin Panel
                                    </h2>
                                    <Badge variant="destructive">
                                        Admin Access
                                    </Badge>
                                </div>

                                <Tabs defaultValue="organizations">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="organizations">
                                            Pending Organizations
                                        </TabsTrigger>
                                        <TabsTrigger value="members">
                                            Member Requests
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="organizations"
                                        className="space-y-4"
                                    >
                                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                                            <p className="text-sm text-yellow-800">
                                                <InfoIcon className="h-4 w-4 inline mr-2" />
                                                New organizations require admin
                                                approval before they can be
                                                fully active.
                                            </p>
                                        </div>

                                        <AdminPendingOrganizations />
                                    </TabsContent>

                                    <TabsContent
                                        value="members"
                                        className="space-y-4"
                                    >
                                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                                            <p className="text-sm text-yellow-800">
                                                <InfoIcon className="h-4 w-4 inline mr-2" />
                                                You can approve member requests
                                                for organizations where you are
                                                an admin.
                                            </p>
                                        </div>

                                        <AdminPendingMembers />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* Engineering Team Admin Access */}
                {!currentUser?.is_admin && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="link"
                                className="mt-6 w-full text-xs text-gray-400 hover:text-gray-600"
                            >
                                Engineering team access
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Engineering Team Verification
                                </DialogTitle>
                                <DialogDescription>
                                    Enter your engineering team code to get
                                    admin access
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const code =
                                        e.currentTarget.engineeringCode.value;
                                    makeUserAdmin(code);
                                }}
                            >
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="engineeringCode">
                                            Engineering Team Code
                                        </Label>
                                        <Input
                                            id="engineeringCode"
                                            name="engineeringCode"
                                            type="password"
                                            placeholder="Enter code"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            This code is only available to the
                                            engineering team members
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit">
                                        Verify & Activate
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}

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
