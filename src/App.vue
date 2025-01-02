<script setup lang="ts">
import {ref, onUnmounted, watch} from "vue";
import useCanvas from "./composables/useCanvas";

const divRef = ref<HTMLDivElement | null>(null);

const {canvas, mount, unmount, reset} = useCanvas();

watch(divRef, (div) => {
	div.appendChild(canvas);
	mount();
})
onUnmounted(unmount);

</script>
<template>
	<div
		ref="divRef"
		@click="reset"
	></div>
</template>
