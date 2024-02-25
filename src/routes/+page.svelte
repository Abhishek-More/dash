<script lang="ts">
	import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';
	import GiDutchBike from 'svelte-icons/gi/GiDutchBike.svelte';
	import TiPlus from 'svelte-icons/ti/TiPlus.svelte';
	import FaMoon from 'svelte-icons/fa/FaMoon.svelte';
	import { frameProcessor } from '$lib/scripts/lane_detection_bad';
	import { toast } from 'svelte-sonner';

	let currentLight = '';
	let stream;
	let videoRef;
	let src;
	let cap;
	let stopSign = false;
	let dark = false;
	let bikeMode = false;
	let p = [];

	onMount(async () => {
		let video: HTMLVideoElement = document.getElementById('vid');
		video.style.width = 640 + 'px';
		video.style.height = 480 + 'px';
		video.setAttribute('autoplay', '');
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
		stream = await navigator.mediaDevices.getUserMedia({
			video: { facingMode: 'environment' },
			audio: false
		});
		videoRef.srcObject = stream;
		src = new cv.Mat(480, 640, cv.CV_8UC4);
		cap = new cv.VideoCapture(video);

		let coco = await cocoSsd.load();

		function countBlackPixels(mat) {
			let blackCount = 0;
			for (let y = 0; y < mat.rows; y++) {
				for (let x = 0; x < mat.cols; x++) {
					let pixel = mat.ucharPtr(y, x);
					// Check if pixel is black (all channels are 0)
					if (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) {
						blackCount++;
					}
				}
			}
			return blackCount;
		}

		// Function to process video stream
		function processVideo() {
			try {
				if (!cocoSsd) {
					return;
				}
				cap.read(src);

				if (dark) {
					let dst = new cv.Mat();
					cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
					cv.GaussianBlur(dst, dst, new cv.Size(5, 5), 0);

					cv.Canny(dst, dst, 50, 150, 3);
					cv.imshow('canvas', dst);
				}

				coco.detect(video).then((predictions) => {
					p = predictions;
				});

				for (let i = 0; i < p.length; i++) {
					if (p[i].class === 'traffic light') {
						const x1 = p[i].bbox[0];
						const y1 = p[i].bbox[1];
						const x2 = x1 + p[i].bbox[2];
						const y2 = y1 + p[i].bbox[3];
						const width = p[i].bbox[2];
						const height = p[i].bbox[3];

						const canvas = document.getElementById('trafficCanvas');
						var ctx = canvas.getContext('2d');
						ctx.drawImage(video, x1, y1, width, height, x1, y1, width, height);
						const imageData = ctx.getImageData(0, 0, width, height);
						const pixels = imageData.data;
						let redCount = 0;
						let yellowCount = 0;
						let greenCount = 0;

						for (let i = 0; i < pixels.length; i += 4) {
							const red = pixels[i];
							const green = pixels[i + 1];
							const blue = pixels[i + 2];
							if (red > 200 && green < 100 && blue < 100) {
								// Red color
								redCount++;
							} else if (green > 200 && red < 100 && blue < 100) {
								// Green color
								greenCount++;
							} else if (red > 200 && green > 200 && blue < 200) {
								// Yellow color
								yellowCount++;
							}
						}

						if (redCount >= yellowCount && redCount >= greenCount) {
							currentLight = 'red';
						} else if (greenCount >= yellowCount && greenCount >= redCount) {
							currentLight = 'green';
						} else {
							currentLight = 'yellow';
						}
						console.log(currentLight);
					} else if (p[i].class === 'stop sign') {
						console.log('STOP SIGN DETECTED');
						if (!stopSign) {
							stopSign = true;
							setTimeout(() => {
								stopSign = false;
							}, 2500);
						}
					} else {
						stopSign = false;
						currentLight = '';
					}
				}
			} catch (error) {
				console.error('Error processing video:', error);
			}
		}

		// Start processing video
		setInterval(processVideo, 100);
	});
</script>

<section
	class={`${stopSign || currentLight == 'red' ? 'flashy' : ''} flex flex-col sm:flex-row gap-8 max-h-screen transition-all h-screen`}
>
	{#if dark}
		<canvas id="canvas" class="rounded-sm" width="640" height="480" />
	{/if}
	<video
		id="vid"
		class={`rounded-sm ${dark ? 'absolute z-50 opacity-0' : 'block'}`}
		width="640"
		height="480"
		autoplay={true}
		muted
		playsinline
		bind:this={videoRef}
	/>
	<div class="flex flex-row sm:flex-col justify-around items-center py-8 w-full h-full">
		<button
			on:click={() => {
				bikeMode = !bikeMode;
				if (bikeMode) {
					toast.success('Bike Mode Activated');
				} else {
					toast.success('Bike Mode Deactivated');
				}
			}}
			class="h-20 w-20 bg-teal-500 rounded-full"
		>
			<div class={`${dark ? 'text-slate-800' : 'text-white'} scale-50 transition-all`}>
				<GiDutchBike />
			</div>
		</button>
		<button
			on:click={() => {
				dark = !dark;
			}}
			class="h-20 w-20 bg-red-500 rounded-full"
		>
			<div class={`${dark ? 'text-slate-800' : 'text-white'} rotate-45 scale-50 transition-all`}>
				<TiPlus />
			</div>
		</button>
		<button
			on:click={() => {
				dark = !dark;
			}}
			class={`${dark ? 'bg-slate-400' : 'bg-slate-800'} h-20 w-20 rounded-full`}
		>
			<div class={`${dark ? 'text-slate-800' : 'text-white'} scale-50 transition-all`}>
				<FaMoon />
			</div>
		</button>
	</div>

	<canvas id="trafficCanvas" class="rounded-sm opacity-0 absolute" width="640" height="480" />
</section>

<style>
	.flashy {
		animation: flash 1s infinite alternate; /* Flash animation */
		background-color: red; /* Initial background color */
	}

	@keyframes flash {
		0% {
			background-color: red; /* Red background color */
		}
		50% {
			background-color: white; /* White background color */
		}
		100% {
			background-color: red; /* Red background color */
		}
	}
</style>
