'use client';

import { useState, useEffect, useRef } from 'react';

interface UseCountAnimationOptions {
	end: number;
	duration?: number;
	startOnInView?: boolean;
}

export function useCountAnimation({ 
	end, 
	duration = 2000, 
	startOnInView = true 
}: UseCountAnimationOptions) {
	const [count, setCount] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const elementRef = useRef<HTMLDivElement>(null);

	// Intersection Observer setup
	useEffect(() => {
		if (!startOnInView) {
			setIsVisible(true);
			return;
		}

		const element = elementRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasStarted) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.2 }
		);

		observer.observe(element);

		return () => {
			observer.unobserve(element);
		};
	}, [hasStarted, startOnInView]);

	// Animation logic
	useEffect(() => {
		if (!isVisible || hasStarted || end === 0) return;

		setHasStarted(true);
		const startTime = Date.now();
		const startValue = 0;

		const animate = () => {
			const currentTime = Date.now();
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function (ease-out)
			const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
			const easedProgress = easeOut(progress);

			const currentCount = Math.round(startValue + (end - startValue) * easedProgress);
			setCount(currentCount);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}, [isVisible, hasStarted, end, duration]);

	return { count, elementRef };
}