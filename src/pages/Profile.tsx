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
import OrderHistory from "@/components/OrderHistory";
import { supabaseCon } from "@/db_api/connection";
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
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AdminPendingOrganizations,
  AdminPendingMembers,
} from "@/components/admin-pending-organizations";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const {
    user: currentUser,
    isAuthenticated,
    logout,
    makeUserAdmin,
  } = useAuth();

  const [marketListings, setNewMarketListings] = useState<MarketplaceItem[]>([]);
  const [serviceListings, setNewServiceListings] = useState<Service[]>([]);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [joinOrgOpen, setJoinOrgOpen] = useState(false);
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

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (currentUser?.user_id) {
        const userOrgsResult = await supabaseCon.getUserOrganizations(currentUser.user_id);
        if (userOrgsResult.success) {
          setUserOrganizations(userOrgsResult.data || []);
        }

        const allOrgsResult = await supabaseCon.getOrganizations();
        if (allOrgsResult.success) {
          setAllOrganizations(allOrgsResult.data || []);
        }
      }
    };

    fetchOrganizations();
  }, [currentUser]);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

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

  return (
    <AppLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <OrderHistory />

        <section>
          <h2 className="text-xl font-semibold mb-4">My Organizations</h2>
          <div className="flex gap-4 mb-4">
            <Button onClick={() => setJoinOrgOpen(true)}>
              <Users className="mr-2 h-4 w-4" /> Join Organization
            </Button>
            <Button onClick={() => setCreateOrgOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Create Organization
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">My Listings</h2>
          {userListings.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            <ul className="space-y-2">
              {userListings.map((listing) => (
                <li key={listing.id}>{listing.title}</li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">My Services</h2>
          {userServices.length === 0 ? (
            <p>No services found.</p>
          ) : (
            <ul className="space-y-2">
              {userServices.map((service) => (
                <li key={service.id}>{service.title}</li>
              ))}
            </ul>
          )}
        </section>

        {currentUser?.is_admin && (
          <section className="mt-6">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
            <Tabs defaultValue="organizations">
              <TabsList>
                <TabsTrigger value="organizations">Pending Organizations</TabsTrigger>
                <TabsTrigger value="members">Member Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="organizations">
                <AdminPendingOrganizations />
              </TabsContent>
              <TabsContent value="members">
                <AdminPendingMembers />
              </TabsContent>
            </Tabs>
          </section>
        )}

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
                <DialogTitle>Engineering Team Verification</DialogTitle>
                <DialogDescription>
                  Enter your engineering team code to get admin access
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const code = e.currentTarget.engineeringCode.value;
                  makeUserAdmin(code);
                }}
              >
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineeringCode">Engineering Team Code</Label>
                    <Input
                      id="engineeringCode"
                      name="engineeringCode"
                      type="password"
                      placeholder="Enter code"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This code is only available to the engineering team members
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Verify & Activate</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full max-w-xs"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
