import { User } from "@/types/user";

export default function ProfilePicture({user}: {
    user: User
}) {
	return (
		<div className="text-center mb-8">
			<div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
				{user.firstName ? user.firstName[0] : user.email[0]}
			</div>
			<h2 className="text-2xl font-bold text-gray-900">
				{user.firstName && user.lastName
					? `${user.firstName} ${user.lastName}`
					: user.email}
			</h2>
			<p className="text-gray-600">{user.email}</p>
		</div>
	);
}
