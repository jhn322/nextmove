import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

// * ==========================================================================
// *                               LEARN LAYOUT
// * ==========================================================================

// ** Navigation Items Configuration ** //
interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

const learnNavItems: NavItem[] = [
  { title: "Introduction", href: "/learn" },
  { title: "Basics of Chess", href: "/learn/basics" },
  { title: "Piece Movement", href: "/learn/piece-movement" },
  { title: "Special Moves", href: "/learn/special-moves" },
  { title: "How Games End", href: "/learn/game-endings" },
  { title: "Basic Tactics", href: "/learn/tactics", disabled: true }, // Example of a future section
  { title: "Opening Principles", href: "/learn/openings", disabled: true },
];

interface LearnLayoutProps {
  children: React.ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen max-h-screen items-stretch"
      // Removed id and autoSaveId as they might not be needed and could cause issues without specific setup
    >
      <ResizablePanel
        defaultSize={20}
        minSize={15}
        maxSize={30}
        className="hidden md:block" // Hide sidebar on small screens, show on medium and up
      >
        <ScrollArea className="h-full px-4 py-6">
          <nav className="grid gap-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Learn Chess
            </h2>
            {learnNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  item.disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                  // Add active state styling if needed, using usePathname from next/navigation
                )}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : 0}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={80} minSize={70}>
        <ScrollArea className="h-full px-4 py-6 lg:px-8">{children}</ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
