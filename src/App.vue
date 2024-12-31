<script setup lang="ts">
import {ref, onUnmounted} from "vue";
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
	class: string,
	history: Pos[],
};
const colors = 'black,blue,green,red,yellow'.split(',');
const circles = ref<Circle[]>([]);
const historySteps = 20;
const setup = () => {
	for (let i = 0; i < 5; i++) {
		circles.value.push({
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1,
			// xVel: Math.random() * 0.02 - 0.01,
			// yVel: Math.random() * 0.02 - 0.01,
			xVel: 0,
			yVel: 0,
			r: Math.random() * 0.05 + 0.02,
			class: colors[i % colors.length],
			history: [],
		})
	}
};
const reset = () => {
	circles.value.length = 0;
	setup();
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
const loop = () => {
	if(!running) { return }
	requestAnimationFrame(loop);
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
		if(circle.history.length > historySteps) {
			circle.history.shift();
		}
		circle.x += circle.xVel;
		circle.y += circle.yVel;
		if(circle.x < -1 || circle.x > 1) {
			circle.xVel *= -1;
		}
		if(circle.y < -1 || circle.y > 1) {
			circle.yVel *= -1;
		}
	});
};
requestAnimationFrame(loop);
const handleMouseMove = (event: MouseEvent) => {
	const rect = document.body.getBoundingClientRect();
	const xMouse = event.clientX;
	const yMouse = event.clientY;
	const min = Math.min(rect.width, rect.height);
	const half = min / 2;
	const diffX = (rect.width / 2) - half;
	const diffY = (rect.height / 2) - half;
	const x = -1 + ((xMouse - diffX) / half);
	const y = -1 + ((yMouse - diffY) / half);
	circles.value[0].x = x;
	circles.value[0].y = y;
};

setup();
window.addEventListener('mousemove', handleMouseMove);

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove);
	running = false;
});
</script>
<template>
	<svg
		viewBox="-1 -1 2 2"
		@click="reset"
	>
		<text
			font-size="0.3"
			text-anchor="middle"
			alignment-baseline="middle"
			class="red fill"
			transform="rotate(-45)"
		>chaos spaghettios</text>
		<g class="circles">
			<ellipse
				v-for="(item, index) in circles"
				:key="index"
				:cx="item.x"
				:cy="item.y"
				:rx="item.r"
				:ry="item.r"
				stroke-width="0.02"
				class="stroke nofill"
				:class="item.class"
			/>
		</g>
		<g class="history">
			<template
				v-for="(circle, circleIndex) in circles"
				:key="circleIndex"
			>
				<ellipse
					v-for="(point, pointIndex) in circle.history"
					:key="[circleIndex, pointIndex].join(',')"
					:cx="point.x"
					:cy="point.y"
					:rx="0.01 + ((circle.r - 0.01) * (pointIndex / circle.history.length))"
					:ry="0.01 + ((circle.r - 0.01) * (pointIndex / circle.history.length))"
					stroke-width="0.02"
					class="stroke nofill"
					:class="circle.class"
				/>
			</template>
		</g>
		<rect
			width="2"
			height="2"
			x="-1"
			y="-1"
			fill="#0000"
			stroke-width="0.02"
			class="black stroke"
		/>
	</svg>
</template>
