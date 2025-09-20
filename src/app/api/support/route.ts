import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const supportTicketSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
	email: z.string().email('Invalid email address'),
	subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
	message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate the request body
		const validatedData = supportTicketSchema.parse(body);

		// Create the support ticket
		const ticket = await prisma.supportTicket.create({
			data: {
				name: validatedData.name,
				email: validatedData.email,
				subject: validatedData.subject,
				message: validatedData.message,
			},
		});

		return NextResponse.json(
			{ 
				message: 'Support ticket created successfully',
				ticketId: ticket.id 
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('[SUPPORT_POST]', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ 
					error: 'Validation failed',
					details: error.issues.map((issue) => ({ 
						field: issue.path.join('.'), 
						message: issue.message 
					}))
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}