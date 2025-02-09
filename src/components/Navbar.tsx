"use client";

import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Puzzle,
  History,
  Settings,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayOpen, setIsPlayOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const { setTheme } = useTheme();

  const playItems = [
    { title: "Easy Bot", href: "/play/easy" },
    { title: "Intermediate Bot", href: "/play/intermediate" },
    { title: "Hard Bot", href: "/play/hard" },
    { title: "Expert Bot", href: "/play/expert" },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Puzzle className="h-7 w-7" />
            <span className="font-bold text-xl tracking-tight">Chess-Next</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-base font-bold px-4 py-2">
                  Play
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-52 gap-1 p-4">
                    {playItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block select-none rounded-md p-2.5 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/history"
                  className="px-4 py-2 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors inline-flex items-center"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/settings"
                  className="px-4 py-2 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors inline-flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Theme Toggle and Login */}
        <div className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="py-2"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="py-2"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="py-2"
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="text-base px-5 py-2 h-10 inline-flex items-center"
          >
            {isLoggedIn ? (
              <>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </>
            )}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="py-2"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="py-2"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="py-2"
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader className="border-b pb-4 mb-4">
                <Link
                  href="/"
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <Puzzle className="h-7 w-7" />
                  <span className="font-bold text-xl">Chess-Next</span>
                </Link>
              </SheetHeader>

              <div className="flex flex-col space-y-4">
                <Collapsible
                  open={isPlayOpen}
                  onOpenChange={setIsPlayOpen}
                  className="space-y-2"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                    Play
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isPlayOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pl-4">
                    {playItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Link
                  href="/history"
                  className="py-2 px-3 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors inline-flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Link>

                <Link
                  href="/settings"
                  className="py-2 px-3 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors inline-flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>

                <div className="pt-4 mt-4 border-t">
                  <Button
                    onClick={() => setIsLoggedIn(!isLoggedIn)}
                    className="w-full text-base py-2 inline-flex items-center justify-center"
                  >
                    {isLoggedIn ? (
                      <>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" /> Login
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
