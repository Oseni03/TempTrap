"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Loader2,
    Plus,
    Copy,
    Trash2,
    Eye,
    EyeOff,
    Key,
    AlertCircle
} from "lucide-react";

interface ApiKey {
    id: string;
    key: string;
    name?: string;
    createdAt: Date;
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
    const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const { data, error } = await authClient.apiKey.create({
                name: newKeyName || `Key ${keys.length + 1}`,
            });

            if (error) throw error;

            if (data) {
                setKeys([data as any, ...keys]);
                setNewKeyName("");
                toast.success("API key generated successfully!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create API key");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteKey = async (id: string) => {
        try {
            const { error } = await authClient.apiKey.delete({
                keyId: id,
            });

            if (error) throw error;

            setKeys(keys.filter((k) => k.id !== id));
            toast.success("API key deleted");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete key");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("API key copied to clipboard");
    };

    const toggleVisibility = (id: string) => {
        setVisibleKeys((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="space-y-8">
            {/* Create Key Card */}
            <Card className="border-border bg-card shadow-none">
                <CardHeader>
                    <CardTitle className="text-xl font-bold tracking-tight">Generate New Key</CardTitle>
                    <CardDescription>
                        Create a new API key to authenticate your requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <Label htmlFor="key-name">Key Name (Optional)</Label>
                            <Input
                                id="key-name"
                                placeholder="e.g. Production Web App"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                            {isCreating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="mr-2 h-4 w-4" />
                            )}
                            Generate Key
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Keys List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight px-1">Your API Keys</h3>
                {keys.length === 0 ? (
                    <Card className="border-dashed border-2 border-border bg-transparent shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground/20 mb-4" />
                            <p className="text-muted-foreground">You haven&apos;t generated any API keys yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {keys.map((apiKey) => (
                            <Card key={apiKey.id} className="border-border bg-card shadow-none overflow-hidden transition-all hover:border-primary/20">
                                <CardContent className="p-0">
                                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Key className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold truncate">{apiKey.name || "Unnamed Key"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all flex-1">
                                                    {visibleKeys[apiKey.id] ? apiKey.key : "temp_••••••••••••••••••••••••"}
                                                </code>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                                                Created on {new Date(apiKey.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:ml-4 self-end sm:self-center">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => toggleVisibility(apiKey.id)}
                                                title={visibleKeys[apiKey.id] ? "Hide Key" : "Show Key"}
                                            >
                                                {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(apiKey.key)}
                                                title="Copy Key"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                                                onClick={() => handleDeleteKey(apiKey.id)}
                                                title="Delete Key"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
