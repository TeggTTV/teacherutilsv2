import Image from 'next/image';

const screenshots = [
    '/jep1.png',
	'/jep2.png',
	'/jep3.png',
	// Add more filenames as needed
];

export default function GamePreview() {
	return (
		<section className="py-12 sm:py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
						See Compyy in Action
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Here’s a sneak peek at what a Jeopardy game looks like
						on Compyy!
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{screenshots.map((src, idx) => (
						<div
							key={src}
							className="rounded-lg overflow-hidden shadow-md bg-gray-50"
						>
							<Image
								src={src}
								alt={`Jeopardy screenshot ${idx + 1}`}
								width={600}
								height={400}
								className="w-full h-auto object-cover"
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
