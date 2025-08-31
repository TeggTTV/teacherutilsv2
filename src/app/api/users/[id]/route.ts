import { NextRequest, NextResponse } from 'next/server';
import { UserService, UpdateUserData } from '@/lib/services/userService';

// GET /api/users/[id] - Get user by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const includeGames = searchParams.get('includeGames') === 'true';

		let user;
		if (includeGames) {
			user = await UserService.getUserWithGames(id);
		} else {
			user = await UserService.getUserById(id);
		}

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					error: 'User not found',
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch user',
			},
			{ status: 500 }
		);
	}
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		const body = await request.json();

		// Check if user exists
		const existingUser = await UserService.getUserById(id);
		if (!existingUser) {
			return NextResponse.json(
				{
					success: false,
					error: 'User not found',
				},
				{ status: 404 }
			);
		}

		// Check if email is being updated and if it already exists
		if (body.email && body.email !== existingUser.email) {
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
		}

		// Check if username is being updated and if it already exists
		if (body.username && body.username !== existingUser.username) {
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

		const updateData: UpdateUserData = {
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

		const updatedUser = await UserService.updateUser(id, updateData);

		return NextResponse.json({
			success: true,
			data: updatedUser,
			message: 'User updated successfully',
		});
	} catch (error) {
		console.error('Error updating user:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to update user',
			},
			{ status: 500 }
		);
	}
}

// DELETE /api/users/[id] - Delete user by ID
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		const deletedUser = await UserService.deleteUser(id);

		return NextResponse.json({
			success: true,
			data: deletedUser,
			message: 'User deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete user',
			},
			{ status: 500 }
		);
	}
}
