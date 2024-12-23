<script setup lang="ts">
import {ref, onUnmounted} from "vue";
type Circle = {
	x: number,
	y: number,
	xVel: number,
	yVel: number,
	r: number,
	class: string,
}
const colors = 'blue,green,black,red,yellow'.split(',');
const circles = ref<Circle[]>([]);
const setup = () => {
	for (let i = 0; i < 30; i++) {
		const colorIndex = Math.floor(Math.random() * colors.length);
		circles.value.push({
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1,
			// xVel: Math.random() * 0.02 - 0.01,
			// yVel: Math.random() * 0.02 - 0.01,
			xVel: 0,
			yVel: 0,
			r: Math.random() * 0.05 + 0.02,
			class: colors[colorIndex],
		})
	}
};
let running = true;
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
const loop = () => {
	if(!running) { return }
	requestAnimationFrame(loop);
	doComparison(circles.value);
	circles.value.forEach((circle) => {
		circle.xVel *= 0.9991;
		circle.yVel *= 0.9991;
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
onUnmounted(() => {
	running = false;
});
const reset = () => {
	circles.value.length = 0;
	setup();
};
setup();
</script>
<template>
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
	<rect
		width="2"
		height="2"
		x="-1"
		y="-1"
		@click="reset"
		fill="#0000"
	/>
</template>
