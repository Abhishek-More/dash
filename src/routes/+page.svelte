<script lang="ts">
	import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';
	import GiDutchBike from 'svelte-icons/gi/GiDutchBike.svelte';
	import TiPlus from 'svelte-icons/ti/TiPlus.svelte';
	import FaMoon from 'svelte-icons/fa/FaMoon.svelte';
	import { frameProcessor } from '$lib/scripts/lane_detection_bad';

	let stream;
	let videoRef;
	let src;
	let cap;
	let dark = false;
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
				const dstCanv = document.getElementById('dst');

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

						const canvas = document.getElementById('dst');
						var ctx = canvas.getContext('2d');

						canvas.width = dstCanv?.clientWidth;
						canvas.height = dstCanv?.clientHeight;
						canvas.style.borderWidth = '5px';
						canvas.style.borderColor = 'black';

						ctx.drawImage(video, x1, y1, width, height, x1, y1, width, height);
					}
					if (p[i].class === 'stop sign') {
						const x1 = p[i].bbox[0];
						const y1 = p[i].bbox[1];
						const x2 = x1 + p[i].bbox[2];
						const y2 = y1 + p[i].bbox[3];
						const width = p[i].bbox[2];
						const height = p[i].bbox[3];

						const canvas = document.getElementById('dst');
						var ctx = canvas.getContext('2d');

						canvas.width = dstCanv?.clientWidth;
						canvas.height = dstCanv?.clientHeight;
						canvas.style.borderWidth = '5px';
						canvas.style.borderColor = 'black';

						ctx.drawImage(video, x1, y1, width, height, x1, y1, width, height);
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
	class={`${dark ? 'bg-slate-800' : 'bg-white'} flex flex-col sm:flex-row gap-8 max-h-screen overflow-hidden transition-all h-screen`}
>
	<video
		id="vid"
		class="rounded-sm"
		width="640"
		height="480"
		autoplay={true}
		muted
		playsinline
		bind:this={videoRef}
	/>
	<div class="flex flex-row sm:flex-col justify-around items-center py-8 w-full h-full">
		<div class="h-20 w-20 bg-teal-500 rounded-full">
			<div class={`${dark ? 'text-slate-800' : 'text-white'} scale-50 transition-all`}>
				<GiDutchBike />
			</div>
		</div>
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
			<div class={`${dark ? 'text-slate-800' : 'text-white'} rotate-45 scale-50 transition-all`}>
				<FaMoon />
			</div>
		</button>
	</div>
	<!-- <canvas id="dst" class="mt-4 rounded-sm" width="640" height="480" /> -->
</section>
