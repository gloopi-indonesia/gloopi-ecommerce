import { ThemeToggle } from '@/components/theme-toggle'
import { FollowUpNotifications } from '@/components/follow-up-notifications'
import { LogoutButton } from './logout-button'
import { Breadcrumb } from './breadcrumb'

export default function TopHeader() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-4 lg:ml-0 ml-12">
                    <Breadcrumb />
                </div>

                <div className="flex items-center gap-2">
                    <FollowUpNotifications />
                    <ThemeToggle />
                    <LogoutButton />
                </div>
            </div>
        </header>
    )
}
