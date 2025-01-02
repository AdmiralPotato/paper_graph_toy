import {ref} from "vue";

const tau = Math.PI * 2;

const canvas: HTMLCanvasElement = document.createElement("canvas");
const context = canvas.getContext("2d");
let {width, height} = canvas;
const resizeCanvas = () => {
	const dpr = window.devicePixelRatio;
	const rect = canvas.getBoundingClientRect();
	const newWidth = rect.width * dpr;
	const newHeight = rect.height * dpr;
	if (
		width !== newWidth ||
		height !== newHeight
	) {
		canvas.width = newWidth;
		canvas.height = newHeight;
		width = newWidth;
		height = newHeight;
		console.log('resized to:', width, height);
	}
}
type Pos = {
	x: number,
	y: number,
};
type Circle = {
	x: number,
	y: number,
	xVel: number,
	yVel: number,
	r: number,
	color: string,
	history: Pos[],
};
const colors = {
	black: '#333',
	blue: '#5c92e7',
	green: '#64bb47',
	red: '#f6687c',
	yellow: '#fbe875',
};
const colorNames = Object.keys(colors);
const circles = ref<Circle[]>([]);
const historySteps = 10;
const setup = () => {
	for (let i = 0; i < colorNames.length * 2; i++) {
		circles.value.push({
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1,
			// xVel: Math.random() * 0.02 - 0.01,
			// yVel: Math.random() * 0.02 - 0.01,
			xVel: 0,
			yVel: 0,
			r: Math.random() * 0.06 + 0.02,
			color: colors[colorNames[i % colorNames.length]],
			history: [],
		})
	}
};
const reset = (clickEvent: MouseEvent) => {
	circles.value.length = 0;
	setup();
	handleMove(clickEvent.clientX, clickEvent.clientY);
};

const attract = (a: Circle, b: Circle) => {
	const diff = {
		x: a.x - b.x,
		y: a.y - b.y,
	};
	const angle = Math.atan2(diff.y, diff.x);
	a.xVel -= Math.cos(angle) * 0.0001;
	a.yVel -= Math.sin(angle) * 0.0001;
	b.xVel += Math.cos(angle) * 0.0001;
	b.yVel += Math.sin(angle) * 0.0001;
};
const doComparison = (items: Circle[]) => {
	for (let i = 0; i < items.length -1; i++) {
		for (let j = i + 1; j < items.length; j++) {
			attract(items[i], items[j]);
		}
	}
};

let running = true;

const tickCircles = () => {
	doComparison(circles.value);
	circles.value[0].xVel = 0;
	circles.value[0].yVel = 0;
	circles.value.forEach((circle) => {
		circle.xVel *= 0.9991;
		circle.yVel *= 0.9991;
		circle.history.push({
			x: circle.x,
			y: circle.y,
		});
		if (circle.history.length > historySteps) {
			circle.history.shift();
		}
		circle.x += circle.xVel;
		circle.y += circle.yVel;
		if (circle.x < -1 || circle.x > 1) {
			circle.xVel *= -1;
		}
		if (circle.y < -1 || circle.y > 1) {
			circle.yVel *= -1;
		}
	});
};

const drawCircle = (x: number, y: number, radius: number, color: string) => {
	context.beginPath();
	// context.moveTo(x, y);
	context.arc(x, y, radius, 0, tau);
	context.closePath();
	context.strokeStyle = color;
	context.lineWidth = 0.03;
	context.stroke();
};
const drawCircles = () => {
	circles.value.forEach(({x, y, r, color, history}) => {
		drawCircle(x, y, r, color);
		history.forEach(({x, y}, pointIndex) => {
			const radius = 0.01 + ((r - 0.01) * (pointIndex / history.length))
			drawCircle(x, y, radius, color);
		})
	});
};

const loop = () => {
	if(!running) { return }
	requestAnimationFrame(loop);
	resizeCanvas();
	const min = Math.min(width, height);
	context.save();
	context.clearRect(0, 0, width, height);
	context.translate(width / 2, height / 2);
	context.scale(min / 2, min / 2);
	tickCircles();
	context.globalCompositeOperation = 'multiply';
	drawCircles();
	context.restore();
};
requestAnimationFrame(loop);

const handleMouseMove = (event: PointerEvent) => {
	handleMove(event.clientX, event.clientY);
};
const handleTouchMove = (event: TouchEvent) => {
	handleMove(
		event.touches[0].clientX,
		event.touches[0].clientY,
	);
};
const handleMove = (xIn: number, yIn: number) => {
	const rect = document.body.getBoundingClientRect();
	const min = Math.min(rect.width, rect.height);
	const half = min / 2;
	const diffX = (rect.width / 2) - half;
	const diffY = (rect.height / 2) - half;
	const x = -1 + ((xIn - diffX) / half);
	const y = -1 + ((yIn - diffY) / half);
	circles.value[0].x = x;
	circles.value[0].y = y;
};

setup();
const passive = { passive: true };
const mount = () => {
	console.log('Canvas mount event called');
	window.addEventListener('pointerdown', handleMouseMove);
	window.addEventListener('pointermove', handleMouseMove);
	window.addEventListener('touchstart', handleTouchMove, passive);
	window.addEventListener('touchmove', handleTouchMove, passive);
}

const unmount = () => {
	console.log('Canvas unmount event called');
	window.removeEventListener('pointerdown', handleMouseMove);
	window.removeEventListener('pointermove', handleMouseMove);
	window.removeEventListener('touchstart', handleTouchMove);
	window.removeEventListener('touchmove', handleTouchMove);
	running = false;
};

export default () => {
	return {
		canvas,
		mount,
		unmount,
		reset,
	};
}
