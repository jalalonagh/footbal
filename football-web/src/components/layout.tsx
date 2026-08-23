"use client";

import { ReactNode } from "react";
import Navbar from "./navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
