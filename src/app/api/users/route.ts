import { NextRequest, NextResponse } from 'next/server';
import { UserService, CreateUserData } from '@/lib/services/userService';

// GET /api/users - Get all users (with pagination)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');
		const query = searchParams.get('q');

		let users;
		if (query) {
			users = await UserService.searchUsers(query, limit);
		} else {
			users = await UserService.getAllUsers(limit, offset);
		}

		return NextResponse.json({
			success: true,
			data: users,
			pagination: {
				limit,
				offset,
				total: users.length,
			},
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch users',
			},
			{ status: 500 }
		);
	}
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.email) {
			return NextResponse.json(
				{
					success: false,
					error: 'Email is required',
				},
				{ status: 400 }
			);
		}

		// Check if email already exists
		const emailExists = await UserService.emailExists(body.email);
		if (emailExists) {
			return NextResponse.json(
				{
					success: false,
					error: 'A user with this email already exists',
				},
				{ status: 409 }
			);
		}

		// Check if username already exists (if provided)
		if (body.username) {
			const usernameExists = await UserService.usernameExists(
				body.username
			);
			if (usernameExists) {
				return NextResponse.json(
					{
						success: false,
						error: 'A user with this username already exists',
					},
					{ status: 409 }
				);
			}
		}

		const userData: CreateUserData = {
			email: body.email,
			firstName: body.firstName,
			lastName: body.lastName,
			username: body.username,
			profileImage: body.profileImage,
			bio: body.bio,
			school: body.school,
			grade: body.grade,
			subject: body.subject,
		};

		const user = await UserService.createUser(userData);

		return NextResponse.json(
			{
				success: true,
				data: user,
				message: 'User created successfully',
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating user:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to create user',
			},
			{ status: 500 }
		);
	}
}
