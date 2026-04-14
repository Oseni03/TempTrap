"use client";

import { authClient } from "@/lib/auth-client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, User, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/contexts/organization-context";
import { useRouter } from "next/navigation";

export function MembersTable() {
    const { activeOrganization: activeOrg, isLoadingActive: isPending, updateMemberRole, removeMember } = useOrganization()
    const members = activeOrg?.members;
    const { data: session } = authClient.useSession();
    const router = useRouter()

    const handleUpdateRole = async (memberId: string, role: string) => {
        try {
            await updateMemberRole(
                memberId,
                role as "admin" | "member",
            );
            toast.success(`Role updated to ${role}`);
            router.refresh();
        } catch (_error) {
            toast.error("Failed to update role");
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await removeMember(memberId);
            toast.success("Member removed");
            router.refresh();
        } catch (_error) {
            toast.error("Failed to remove member");
        }
    };

    if (isPending) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members?.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{member.user.name}</span>
                                        <span className="text-xs text-muted-foreground">{member.user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                                    {member.role === "owner" && <Shield className="mr-1 h-3 w-3" />}
                                    {member.role}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {member.role !== "owner" && member.userId !== session?.user.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => handleUpdateRole(member.id, member.role === "admin" ? "member" : "admin")}
                                            >
                                                Make {member.role === "admin" ? "Member" : "Admin"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove Member
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {members?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                No members found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
