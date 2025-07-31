import prisma from '@/lib/prisma'
import { generateSerial } from '@/lib/serial'
import { getErrorResponse } from '@/lib/utils'
import { isIranianPhoneNumberValid } from '@persepolis/regex'
import { sendTransactionalSMS } from '@persepolis/sms'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
   try {
      const OTP = generateSerial({})

      const { phone, email } = await req.json()

      if (!email) {
         return getErrorResponse(400, 'Email is required for admin authentication')
      }

      // Use isPhoneNumberValid if international
      if (isIranianPhoneNumberValid(phone)) {
         await prisma.owner.upsert({
            where: { email: email.toString().toLowerCase() },
            update: {
               phone: phone.toString().toLowerCase(),
               OTP,
            },
            create: {
               email: email.toString().toLowerCase(),
               phone: phone.toString().toLowerCase(),
               OTP,
            },
         })

         await sendTransactionalSMS({
            Mobile: phone,
            TemplateId: 100000,
            Parameters: [
               {
                  name: 'Code',
                  value: OTP,
               },
            ],
         })

         return new NextResponse(
            JSON.stringify({
               status: 'success',
               phone,
            }),
            {
               status: 200,
               headers: { 'Content-Type': 'application/json' },
            }
         )
      }

      if (!isIranianPhoneNumberValid(phone)) {
         return getErrorResponse(400, 'Incorrect Phone Number')
      }
   } catch (error) {
      console.error(error)
      if (error instanceof ZodError) {
         return getErrorResponse(400, 'failed validations', error)
      }

      return getErrorResponse(500, error.message)
   }
}
