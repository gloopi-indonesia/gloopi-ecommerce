'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

type BreadcrumbItem = {
    href: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
}

export function Breadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    const breadcrumbItems: BreadcrumbItem[] = [
        { href: '/', label: 'Dashboard', icon: Home },
        ...segments.map((segment, index) => {
            const href = '/' + segments.slice(0, index + 1).join('/')
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
            return { href, label }
        })
    ]

    // Don't show breadcrumb on the main dashboard
    if (pathname === '/') {
        return null
    }

    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1
                const Icon = item.icon

                return (
                    <div key={item.href} className="flex items-center">
                        {index === 0 && Icon ? (
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-1 hover:text-foreground transition-colors",
                                    isLast && "text-foreground font-medium"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ) : (
                            <>
                                <ChevronRight className="h-4 w-4 mx-1" />
                                {isLast ? (
                                    <span className="text-foreground font-medium">{item.label}</span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
