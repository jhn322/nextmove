"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    // For auth pages, render only children without Navbar/Footer
    return <main className="flex-grow">{children}</main>;
  }

  // For all other pages, render Navbar and Footer
  return (
    <>
      <Navbar />
      <main className="flex-grow pb-20">{children}</main>
      <Footer />
    </>
  );
};

export default PageWrapper;
