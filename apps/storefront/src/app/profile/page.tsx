import { Metadata } from 'next'
import { ProfileForm } from './components/profile-form'

export const metadata: Metadata = {
   title: 'Profil Saya - Gloopi',
   description: 'Kelola profil dan informasi akun Anda',
}

export default function ProfilePage() {
   return (
      <div className="container mx-auto py-8">
         <div className="max-w-2xl mx-auto">
            <div className="mb-8">
               <h1 className="text-2xl font-bold">Profil Saya</h1>
               <p className="text-muted-foreground">
                  Kelola informasi profil dan pengaturan akun Anda
               </p>
            </div>
            
            <ProfileForm />
         </div>
      </div>
   )
}