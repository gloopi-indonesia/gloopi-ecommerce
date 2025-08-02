'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSidebar } from '@/providers/sidebar-provider'
import {
    BarChart3,
    Package,
    ShoppingCart,
    Users,
    Building2,
    FileText,
    CreditCard,
    Receipt,
    Image,
    Code,
    TrendingUp,
    MessageSquare,
    Tag,
    Home,
    Menu,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { isCollapsed, setIsCollapsed } = useSidebar()

    const routes = [
        {
            href: `/`,
            label: 'Dashboard',
            active: pathname === `/`,
            icon: Home,
        },
        {
            href: `/quotations`,
            label: 'Quotations',
            active: pathname.includes(`/quotations`),
            icon: FileText,
        },
        {
            href: `/orders`,
            label: 'Orders',
            active: pathname.includes(`/orders`),
            icon: ShoppingCart,
        },
        {
            href: `/products`,
            label: 'Products',
            active: pathname.includes(`/products`),
            icon: Package,
        },
        {
            href: `/categories`,
            label: 'Categories',
            active: pathname.includes(`/categories`),
            icon: Tag,
        },
        {
            href: `/brands`,
            label: 'Brands',
            active: pathname.includes(`/brands`),
            icon: Tag,
        },
        {
            href: `/customers`,
            label: 'Customers',
            active: pathname.includes(`/customers`),
            icon: Users,
        },
        {
            href: `/companies`,
            label: 'Companies',
            active: pathname.includes(`/companies`),
            icon: Building2,
        },
        {
            href: `/follow-ups`,
            label: 'Follow-ups',
            active: pathname.includes(`/follow-ups`),
            icon: MessageSquare,
        },
        {
            href: `/payments`,
            label: 'Payments',
            active: pathname.includes(`/payments`),
            icon: CreditCard,
        },
        {
            href: `/tax-invoices`,
            label: 'Tax Invoices',
            active: pathname.includes(`/tax-invoices`),
            icon: Receipt,
        },
        {
            href: `/banners`,
            label: 'Banners',
            active: pathname.includes(`/banners`),
            icon: Image,
        },
        {
            href: `/codes`,
            label: 'Codes',
            active: pathname.includes(`/codes`),
            icon: Code,
        },
        {
            href: `/reports`,
            label: 'Reports',
            active: pathname.includes(`/reports`),
            icon: BarChart3,
        },
        {
            href: `/analytics`,
            label: 'Analytics',
            active: pathname.includes(`/analytics`),
            icon: TrendingUp,
        },
    ]

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "flex h-full flex-col fixed inset-y-0 z-50 bg-background border-r transition-all duration-300 ease-in-out",
                "lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                isCollapsed ? "w-16" : "w-64"
            )}>
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6 relative">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-wider">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground font-bold text-sm">G</span>
                        </div>
                        {!isCollapsed && <span>ADMIN</span>}
                    </Link>

                    {/* Collapse button - desktop only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border items-center justify-center hover:bg-accent"
                    >
                        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6">
                    <div className="px-3 space-y-1">
                        {routes.map((route) => {
                            const Icon = route.icon
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground group',
                                        route.active
                                            ? 'bg-accent text-accent-foreground font-medium'
                                            : 'text-muted-foreground',
                                        isCollapsed && 'justify-center'
                                    )}
                                    title={isCollapsed ? route.label : undefined}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    {!isCollapsed && <span>{route.label}</span>}
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </>
    )
}
