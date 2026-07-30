// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import './i18n/config';
import { vi } from 'vitest';

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

if (!(globalThis as any).ResizeObserver) {
	(globalThis as any).ResizeObserver = ResizeObserverMock;
}

if (!HTMLCanvasElement.prototype.getContext || !vi.isMockFunction(HTMLCanvasElement.prototype.getContext)) {
	const mock2DContext = {
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		strokeRect: vi.fn(),
		beginPath: vi.fn(),
		closePath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		arc: vi.fn(),
		stroke: vi.fn(),
		fill: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		setLineDash: vi.fn(),
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
	};

	HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
		...mock2DContext,
	})) as any;
}
