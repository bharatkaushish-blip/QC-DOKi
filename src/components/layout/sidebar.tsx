"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings,
  ArrowRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Batches", href: "/batches", icon: Package },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

const MotionLink = motion.create(Link);

const ACCENT = "#ff6900";

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">DOKi</span>
          <span className="text-sm font-medium text-gray-500">QC Tool</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-hidden">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <motion.div
              key={item.href}
              className="flex items-center gap-1 cursor-pointer overflow-hidden rounded-md"
              initial="initial"
              whileHover="hover"
              animate={isActive ? "active" : "initial"}
            >
              {/* Animated arrow — slides in from left on hover */}
              <motion.div
                variants={{
                  initial: { x: "-100%", opacity: 0 },
                  hover: { x: 0, opacity: 1 },
                  active: { x: 0, opacity: 1 },
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex-shrink-0"
                style={{ color: ACCENT }}
              >
                <ArrowRight strokeWidth={2.5} className="h-5 w-5" />
              </motion.div>

              {/* Nav link — slides right on hover to make room for arrow */}
              <MotionLink
                href={item.href}
                variants={{
                  initial: { x: -24, color: "#4b5563" },
                  hover: { x: 0, color: ACCENT },
                  active: { x: 0, color: ACCENT },
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={cn(
                  "flex items-center gap-3 py-2 px-1 text-sm font-semibold no-underline whitespace-nowrap",
                  isActive && "font-bold"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </MotionLink>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}
