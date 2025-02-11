import Link from "next/link";
import { Puzzle } from "lucide-react";

const difficultyLevels = [
  {
    name: "Beginner",
    href: "/play/beginner",
    description: "Learn the basics with a bot that makes predictable moves.",
    color: "bg-emerald-500/30 hover:bg-emerald-500/20 border-emerald-500/50",
  },
  {
    name: "Easy",
    href: "/play/easy",
    description: "Practice basic strategies with slightly improved moves.",
    color: "bg-green-500/30 hover:bg-green-500/20 border-green-500/50",
  },
  {
    name: "Intermediate",
    href: "/play/intermediate",
    description:
      "Test your skills against a bot with moderate tactical awareness.",
    color: "bg-cyan-500/30 hover:bg-cyan-500/20 border-cyan-500/50",
  },
  {
    name: "Advanced",
    href: "/play/advanced",
    description: "Face stronger tactical play and strategic planning.",
    color: "bg-blue-500/30 hover:bg-blue-500/20 border-blue-500/50",
  },
  {
    name: "Hard",
    href: "/play/hard",
    description:
      "Challenge yourself with advanced strategies and combinations.",
    color: "bg-violet-500/30 hover:bg-violet-500/20 border-violet-500/50",
  },
  {
    name: "Expert",
    href: "/play/expert",
    description:
      "Test yourself against sophisticated positional understanding.",
    color: "bg-purple-500/30 hover:bg-purple-500/20 border-purple-500/50",
  },
  {
    name: "Master",
    href: "/play/master",
    description:
      "Face the second strongest bot with sophisticated chess understanding.",
    color: "bg-orange-500/30 hover:bg-orange-500/20 border-orange-500/50",
  },
  {
    name: "Grandmaster",
    href: "/play/grandmaster",
    description: "Challenge the ultimate bot with masterful chess execution.",
    color: "bg-red-500/30 hover:bg-red-500/20 border-red-500/50",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <Puzzle className="h-16 w-16 mx-auto" />
          <h1 className="text-4xl font-bold">Welcome to Chess-Next</h1>
          <p className="text-xl text-muted-foreground">
            Challenge yourself against bot opponents at different skill levels
            and see if you can win.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {difficultyLevels.map((level) => (
            <Link
              key={level.name}
              href={level.href}
              className={`p-6 rounded-xl border ${level.color} transition-all duration-200 hover:scale-[1.02]`}
            >
              <h2 className="text-2xl font-bold mb-2">{level.name}</h2>
              <p className="text-muted-foreground">{level.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
