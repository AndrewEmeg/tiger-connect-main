import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseCon } from "@/db_api/connection.ts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, Info } from "lucide-react";
import { organizationTypeNames } from "@/models/Event";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/models/User";
import { PendingMember, Organization } from "@/models/Organization";

interface PendingOrganization {
    id: string;
    name: string;
    type: string;
    description: string;
    adminOrganizations: Organization[];
    pendingMembers: PendingMember[];
}

interface AdminPendingOrganizationsProps {
    adminOrganizations: Organization[];
    pendingMembers: PendingMember[];
}

export function AdminPendingOrganizations() {
    const { currentUser } = useAuth();
    const [pendingOrganizations, setPendingOrganizations] = useState<
        PendingOrganization[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    const fetchPendingOrganizations = useCallback(async () => {
        if (!currentUser?.user_id) return;

        try {
            setLoading(true);
            const result = await supabaseCon.getPendingOrganizations();

            if (result.success && result.data) {
                setPendingOrganizations(result.data as PendingOrganization[]);
            } else {
                console.error(
                    "Failed to fetch pending organizations:",
                    result.error
                );
                toast.error("Failed to fetch pending organizations");
            }
        } catch (error) {
            console.error("Error fetching pending organizations:", error);
            toast.error("An error occurred while fetching organizations");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const handleApproveOrganization = async (organizationId: string) => {
        if (!currentUser?.user_id) return;

        setApproving(organizationId);
        try {
            const result = await supabaseCon.approveOrganization(
                organizationId
            );
            if (result.success) {
                toast.success("Organization approved successfully");
                await fetchPendingOrganizations();
            } else {
                toast.error("Failed to approve organization");
            }
        } catch (error) {
            console.error("Error approving organization:", error);
            toast.error("An error occurred while approving the organization");
        } finally {
            setApproving(null);
        }
    };

    const handleRejectOrganization = async (orgId: string) => {
        setLoading(true);
        try {
            const result = await supabaseCon.rejectOrganization(orgId);

            if (result.success) {
                toast.success("Organization rejected");
                setPendingOrganizations((prev) =>
                    prev.filter((org) => org.id !== orgId)
                );
            } else {
                toast.error(result.error || "Failed to reject organization");
            }
        } catch (error) {
            console.error("Error rejecting organization:", error);
            toast.error(
                "An unexpected error occurred during organization rejection"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.is_admin) {
            fetchPendingOrganizations();
        } else {
            // If not an admin, don't show loading, just show nothing or an appropriate message
            setLoading(false);
            setPendingOrganizations([]);
        }
    }, [currentUser, fetchPendingOrganizations]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-grambling-gold" />
                <span className="ml-2 text-gray-600">
                    Loading pending organizations...
                </span>
            </div>
        );
    }

    if (!currentUser?.is_admin) {
        // Optional: Show a message if the user is not a system admin
        return (
            <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Admin access required to view pending organizations.</p>
            </div>
        );
    }

    if (pendingOrganizations.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No pending organizations to approve</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pending Organizations</h2>
            {loading ? (
                <div>Loading...</div>
            ) : pendingOrganizations.length === 0 ? (
                <div>No pending organizations</div>
            ) : (
                <div className="space-y-4">
                    {pendingOrganizations.map((org) => (
                        <div key={org.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {org.adminOrganizations[0]?.name}
                                    </h3>
                                    <p className="text-gray-600">
                                        {org.adminOrganizations[0]?.type}
                                    </p>
                                    <p className="mt-2">
                                        {org.adminOrganizations[0]?.description}
                                    </p>
                                    <div className="mt-4">
                                        <h4 className="font-medium">
                                            Pending Members:
                                        </h4>
                                        <ul className="list-disc list-inside">
                                            {org.pendingMembers.map(
                                                (member) => (
                                                    <li key={member.id}>
                                                        {member.user_id}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        handleApproveOrganization(org.id)
                                    }
                                    disabled={approving === org.id}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {approving === org.id
                                        ? "Approving..."
                                        : "Approve"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function AdminPendingMembers() {
    const { currentUser } = useAuth();
    const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
    const [adminOrganizations, setAdminOrganizations] = useState<
        Organization[]
    >([]); // Use Organization type
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    const fetchAdminOrganizations = async () => {
        const { data: orgs, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("admin_id", currentUser?.user_id);

        if (error) {
            console.error("Error fetching admin organizations:", error);
            return;
        }

        setAdminOrganizations(orgs as Organization[]);
    };

    const fetchPendingMembers = async () => {
        const { data: members, error } = await supabase
            .from("organization_members")
            .select(
                `
                *,
                users (id, email, full_name),
                organizations (id, name, type, description)
            `
            )
            .eq("status", "pending");

        if (error) {
            console.error("Error fetching pending members:", error);
            return;
        }

        setPendingMembers(members as PendingMember[]);
    };

    const handleApproveMember = async (
        userId: string,
        organizationId: string
    ) => {
        const { error } = await supabase
            .from("organization_members")
            .update({ status: "approved" })
            .eq("user_id", userId)
            .eq("organization_id", organizationId);

        if (error) {
            toast.error("Failed to approve member");
            return;
        }

        toast.success("Member approved successfully");
        fetchPendingMembers();
    };

    useEffect(() => {
        if (currentUser && currentUser.user_id) {
            fetchPendingMembers();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-grambling-gold" />
                <span className="ml-2 text-gray-600">
                    Loading pending member requests...
                </span>
            </div>
        );
    }

    if (
        !loading &&
        adminOrganizations.length === 0 &&
        pendingMembers.length === 0
    ) {
        // Check if the user has *any* org memberships to differentiate
        // This might require an extra check or rely on profile data if available
        // For simplicity, assume if adminOrgs is empty, they aren't an admin of anything relevant
        return (
            <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>
                    You are not an admin of any organizations with pending
                    members.
                </p>
            </div>
        );
    }

    if (pendingMembers.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No pending member requests to approve</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingMembers.map((member: PendingMember) => (
                <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900">
                                {member.user.first_name} {member.user.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {member.user.email}
                            </p>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900">
                                {member.organization.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {
                                    organizationTypeNames[
                                        member.organization.type
                                    ]
                                }
                            </p>
                            <p className="text-sm text-gray-500">
                                Status: {member.status}
                            </p>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                    </td>
                </tr>
            ))}
        </div>
    );
}
