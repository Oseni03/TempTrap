"use client";

import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Sparkles, Send } from "lucide-react";
import { submitSurvey, type SurveyData } from "@/server/survey";
import { authClient } from "@/lib/auth-client";

interface SurveyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PRESET_CHALLENGES = [
    "High latency in current email verification",
    "Too many false positives with existing tools",
    "Scaling API calls without breaking the budget",
    "Integrating trust signals into a complex workflow",
    "Other"
];

export function SurveyModal({ open, onOpenChange }: SurveyModalProps) {
    const { data: session } = authClient.useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [challenge, setChallenge] = useState("");
    const [otherChallenge, setOtherChallenge] = useState("");
    const [currentSolution, setCurrentSolution] = useState("");

    const handleNext = () => {
        if (!challenge) {
            toast.error("Please select a challenge first");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!currentSolution) {
            toast.error("Please describe your current solution");
            return;
        }

        setLoading(true);
        try {
            const data: SurveyData = {
                challenge,
                otherChallenge: challenge === "Other" ? otherChallenge : undefined,
                currentSolution,
                userEmail: session?.user?.email || undefined,
                userName: session?.user?.name || undefined,
            };

            const result = await submitSurvey(data);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Thank you! We'll reach out soon.");
                onOpenChange(false);
                // Reset for next time
                setTimeout(() => {
                    setStep(1);
                    setChallenge("");
                    setOtherChallenge("");
                    setCurrentSolution("");
                }, 500);
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const challengeText = challenge === "Other" ? otherChallenge : challenge;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-border/50 shadow-2xl overflow-hidden p-0">
                <div className="bg-primary/5 h-24 flex items-center justify-center border-b border-border/50 relative overflow-hidden">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-none" />
                </div>
                
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {step === 1 ? "Help us build the perfect Pro plan" : "One last thing"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-1">
                            {step === 1 
                                ? "Tell us a bit about your needs and we'll help you get started with a customized setup." 
                                : "Give us some context so we can provide the best possible solution."}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 1 ? (
                        <div className="space-y-4 py-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <Label className="text-sm font-semibold">
                                What's the biggest challenge you're trying to solve with this API right now?
                            </Label>
                            <RadioGroup 
                                value={challenge} 
                                onValueChange={setChallenge}
                                className="gap-3"
                            >
                                {PRESET_CHALLENGES.map((option) => (
                                    <div 
                                        key={option} 
                                        className={`flex items-center space-x-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                                            challenge === option 
                                                ? "border-primary bg-primary/5 shadow-sm" 
                                                : "border-border hover:border-border-hover hover:bg-muted/30"
                                        }`}
                                        onClick={() => setChallenge(option)}
                                    >
                                        <RadioGroupItem value={option} id={option} className="sr-only" />
                                        <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${challenge === option ? "bg-primary" : "bg-transparent"}`}>
                                            {challenge === option && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                                        </div>
                                        <Label htmlFor={option} className="flex-1 cursor-pointer text-sm font-medium">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            {challenge === "Other" && (
                                <div className="animate-in zoom-in-95 duration-200 pt-2">
                                    <Input 
                                        placeholder="Please specify your challenge..." 
                                        value={otherChallenge}
                                        onChange={(e) => setOtherChallenge(e.target.value)}
                                        className="rounded-xl border-primary/30 focus-visible:ring-primary/20"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 py-2 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">
                                    How do you currently solve {challengeText ? `"${challengeText}"` : "this problem"} without this tool?
                                </Label>
                                <Textarea 
                                    placeholder="Tell us about your current workflow or competitors you're evaluating..." 
                                    value={currentSolution}
                                    onChange={(e) => setCurrentSolution(e.target.value)}
                                    className="min-h-[120px] rounded-xl border-border resize-none focus-visible:ring-primary/20 p-4"
                                />
                            </div>
                            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-[13px] flex gap-3">
                                <Sparkles className="h-5 w-5 shrink-0 text-orange-500" />
                                <p>We'll use this info to tailor our Pro offering specifically for your use case.</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 pt-0 flex-row justify-between items-center sm:justify-between border-t border-border/10">
                    <div className="flex gap-1">
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step === 1 ? "bg-primary" : "bg-muted"}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step === 2 ? "bg-primary" : "bg-muted"}`} />
                    </div>
                    
                    {step === 1 ? (
                        <Button 
                            onClick={handleNext} 
                            disabled={!challenge || (challenge === "Other" && !otherChallenge)}
                            className="rounded-full px-8 shadow-md hover:shadow-lg transition-all"
                        >
                            Next
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={() => setStep(1)}
                                className="rounded-full text-muted-foreground hover:bg-muted/50"
                            >
                                Back
                            </Button>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={loading}
                                className="rounded-full px-8 shadow-md hover:shadow-lg transition-all gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Submit <Send className="h-3.5 w-3.5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
