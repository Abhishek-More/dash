<script lang="ts">
	import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';
	import GiDutchBike from 'svelte-icons/gi/GiDutchBike.svelte';
	import TiPlus from 'svelte-icons/ti/TiPlus.svelte';
	import FaMoon from 'svelte-icons/fa/FaMoon.svelte';
	import { frameProcessor } from '$lib/scripts/lane_detection_bad';
	import { toast } from 'svelte-sonner';
	import { initializeAccelerometer } from '$lib/scripts/accelerometer.ts';

	let currentLight = '';
	let stream;
	let videoRef;
	let src;
	let cap;
	let stopSign = false;
	let closeCar = false;
	let laneDeparture = false;
	let dark = false;
	let bikeMode = false;
	let p = [];
	let crashDetected = false;
	let accelerometerInitialized = false;

	async function handleMotion(event: DeviceMotionEvent) {
		if (
			Math.abs(event.acceleration.x) > 170 ||
			Math.abs(event.acceleration.y) > 170 ||
			Math.abs(event.acceleration.z) > 170
		) {
			if (crashDetected === false) {
				console.log('CRASH DETECTED');
				alert('CRASH DETECTED');
				// console.log("Sending SMS to " + phoneNumber);
				await fetch('/api/crash-message', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						name: 'A user',
						phoneNumber: '',
						location: 'College Station, TX'
					})
				});
			}
			crashDetected = true;
		}
	}

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

				if (bikeMode) {
					const canvas = document.getElementById('laneCanvas');
					canvas.width = video?.clientWidth;
					canvas.height = video?.clientHeight / 3;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(
						video,
						0,
						(video.height * 2) / 3,
						video.width,
						video.height / 3,
						0,
						0,
						video?.clientWidth,
						video?.clientHeight / 3
					);
					// Read the image from the canvas
					let dst = new cv.Mat();
					cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
					cv.GaussianBlur(dst, dst, new cv.Size(5, 5), 0);
					cv.Canny(dst, dst, 50, 150, 3);

					// Find lines using HoughLines
					let lines = new cv.Mat();
					cv.HoughLines(dst, lines, 1, Math.PI / 180, 75, 0, 0, 0, Math.PI);

					// Draw lines on the original image
					let checked = [];
					for (let i = 0; i < lines.rows; ++i) {
						if (!checked.includes(i)) {
							checked.push(i);
							let rho = lines.data32F[i * 2];
							let theta = lines.data32F[i * 2 + 1];
							let a = Math.cos(theta);
							let b = Math.sin(theta);
							let x0 = a * rho;
							let y0 = b * rho;
							let pt1 = { x: Math.round(x0 + 1000 * -b), y: Math.round(y0 + 1000 * a) };
							let pt2 = { x: Math.round(x0 - 1000 * -b), y: Math.round(y0 - 1000 * a) };
							for (let j = i + 1; j < lines.rows; ++j) {
								if (!checked.includes(j)) {
									let rho2 = lines.data32F[j * 2];
									let theta2 = lines.data32F[j * 2 + 1];
									let a2 = Math.cos(theta2);
									let b2 = Math.sin(theta2);
									let x02 = a2 * rho2;
									let y02 = b2 * rho2;
									let pt3 = { x: Math.round(x02 + 1000 * -b2), y: Math.round(y02 + 1000 * a2) };
									let pt4 = { x: Math.round(x02 - 1000 * -b2), y: Math.round(y02 - 1000 * a2) };
									if (
										Math.sqrt(
											Math.sqrt((pt1.x - pt3.x) ** 2 + (pt1.y - pt3.y) ** 2) +
												Math.sqrt((pt2.x - pt4.x) ** 2 + (pt2.y - pt4.y) ** 2)
										) <
										video?.clientWidth * 0.03
									) {
										checked.push(j);
									}
								}
							}
							if (Math.abs(pt1.y - pt2.y) > video?.clientHeight * 0.2) {
								// Draw lines on the canvas
								ctx.beginPath();
								ctx.moveTo(pt1.x, pt1.y);
								ctx.lineTo(pt2.x, pt2.y);
								ctx.strokeStyle = 'red';
								ctx.lineWidth = 2;
								ctx.stroke();
								if (
									pt1.x > video.clientWidth * 0.0 &&
									pt1.x < video.clientWidth * 1 &&
									pt2.x > video.clientWidth * 0 &&
									pt2.x < video.clientWidth * 1
								) {
									if (!laneDeparture) {
										laneDeparture = true;
										setTimeout(() => {
											laneDeparture = false;
										}, 2500);
									}
								}
							}
						}
					}
					cv.imshow('laneCanvas', src);
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
					} else if (p[i].class === 'car' || p[i].class === 'truck') {
						const x1 = p[i].bbox[0];
						const y1 = p[i].bbox[1];
						const width = p[i].bbox[2];
						const height = p[i].bbox[3];

						const trafficCanvas = document.getElementById('trafficCanvas');

						if (
							width > trafficCanvas?.clientWidth / 3 ||
							height > trafficCanvas?.clientHeight / 3
						) {
							closeCar = true;
							console.log('CLOSE CAR DETECTED');
						}

						setTimeout(() => {
							stopSign = false;
						}, 2500);
					} else {
						stopSign = false;
						closeCar = false;
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

{#if !accelerometerInitialized}
	<button
		on:click={() => {
			initializeAccelerometer(handleMotion);
			accelerometerInitialized = true;
		}}>Initialize Accelerometer</button
	>
{/if}

<section
	class={`${stopSign || currentLight == 'red' || laneDeparture || closeCar ? 'flashy' : ''} flex flex-col sm:flex-row gap-8 max-h-screen transition-all h-screen`}
>
	{#if dark}
		<canvas id="canvas" class="rounded-sm" width="640" height="480" />
	{/if}
	{#if bikeMode}
		<canvas id="laneCanvas" class="rounded-sm" width="640" height="480" />
	{/if}
	<video
		id="vid"
		class={`rounded-sm ${dark || bikeMode ? 'absolute z-50 opacity-0' : 'block'}`}
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
				dark = false;
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
				bikeMode = false;
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
