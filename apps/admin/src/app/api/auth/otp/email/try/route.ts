import config from '@/config/site'
import Mail from '@/emails/verify'
import prisma from '@/lib/prisma'
import { generateSerial } from '@/lib/serial'
import { getErrorResponse } from '@/lib/utils'
import { sendMail } from '@persepolis/mail'
import { isEmailValid } from '@persepolis/regex'
import { render } from '@react-email/render'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
   try {
      const OTP = generateSerial({})

      const { email } = await req.json()

      if (isEmailValid(email)) {
         await prisma.adminUser.upsert({
            where: { email: email.toString().toLowerCase() },
            update: {
               OTP,
            } as any,
            create: {
               email: email.toString().toLowerCase(),
               name: 'Admin User', // Default name for newly created admin users
               password: 'temp_password', // This should be changed after OTP verification
               OTP,
            } as any,
         })

         // Skip email sending in development if credentials are not configured
         if (process.env.NODE_ENV === 'production' || (process.env.MAIL_SMTP_USER && process.env.MAIL_SMTP_PASS)) {
            await sendMail({
               name: config.name,
               to: email,
               subject: 'Verify your email.',
               html: await render(Mail({ code: OTP, name: config.name })),
            })
         } else {
            console.log(`Development mode: OTP for ${email} is: ${OTP}`)
         }

         return new NextResponse(
            JSON.stringify({
               status: 'success',
               email,
            }),
            {
               status: 200,
               headers: { 'Content-Type': 'application/json' },
            }
         )
      }

      if (!isEmailValid(email)) {
         return getErrorResponse(400, 'Incorrect Email')
      }
   } catch (error) {
      console.error(error)
      if (error instanceof ZodError) {
         return getErrorResponse(400, 'failed validations', error)
      }

      return getErrorResponse(500, error.message)
   }
}
