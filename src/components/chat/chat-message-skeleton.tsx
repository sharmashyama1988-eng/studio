import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot } from "lucide-react";

export function ChatMessageSkeleton() {
    return (
        <div className="flex items-start gap-4 justify-start animate-in fade-in">
            <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback>
                    <Bot className="h-5 w-5" />
                </AvatarFallback>
            </Avatar>
            <div className="max-w-[85%] rounded-lg p-3 text-sm shadow-md bg-card">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
}
