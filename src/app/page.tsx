import { getStartingPrompts } from "@/app/actions";
import { ChatInterface } from "@/components/chat/chat-interface";
import { BrainCircuit } from "lucide-react";

export default async function Home() {
  const startingPrompts = await getStartingPrompts();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b p-4 flex items-center gap-3 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <BrainCircuit className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          Vyom AI
        </h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface startingPrompts={startingPrompts} />
      </main>
    </div>
  );
}
