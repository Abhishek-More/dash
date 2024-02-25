<script lang="ts">
	import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';
	import { frameProcessor } from "$lib/scripts/lane_detection_bad";

	let stream;
	let videoRef;
	let src;
	let cap;
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
				cap.read(src);
				let newMat = new cv.Mat();
				cv.cvtColor(src, newMat, cv.COLOR_RGB2RGBA);
				cv.imshow('dst', newMat);

				const dstCanv = document.getElementById('dst');

				// Lane detection
				frameProcessor(newMat);



				console.log('detecting');
				cocoSsd.load().then((model) => {
					model.detect(dstCanv).then((predictions) => {
						p = predictions;
					});
				});

				console.log(p);

				for (let i = 0; i < p.length; i++) {
					if (p[i].class === 'traffic light') {
						const x1 = p[i].bbox[0];
						const y1 = p[i].bbox[1];
						const x2 = x1 + p[i].bbox[2];
						const y2 = y1 + p[i].bbox[3];
						const width = p[i].bbox[2];
						const height = p[i].bbox[3];

						const canvas = document.createElement('canvas');
						var ctx = canvas.getContext('2d');

						canvas.width = dstCanv?.clientWidth;
						canvas.height = dstCanv?.clientHeight;
						canvas.style.borderWidth = '5px';
						canvas.style.borderColor = 'black';

						ctx.drawImage(dstCanv, x1, y1, width, height, x1, y1, width, height);
						document.body.appendChild(canvas);
					}
					if (p[i].class === 'car' || p[i].class === 'truck') {
						const x1 = p[i].bbox[0];
						const y1 = p[i].bbox[1];
						const width = p[i].bbox[2];
						const height = p[i].bbox[3];

						const canvas = document.createElement('canvas');
						var ctx = canvas.getContext('2d');

						if (width > dstCanv?.clientWidth / 4 || height > dstCanv?.clientHeight / 4) {
							console.log('close!');
						}
						canvas.width = dstCanv?.clientWidth;
						canvas.height = dstCanv?.clientHeight;
						canvas.style.borderWidth = '5px';
						canvas.style.borderColor = 'black';

						ctx.drawImage(dstCanv, x1, y1, width, height, x1, y1, width, height);
						document.body.appendChild(canvas);
					}
				}
			} catch (error) {
				console.error('Error processing video:', error);
			}
		}

		// Start processing video
		setInterval(processVideo, 2000);
	});
</script>

<section class="container mx-auto px-4">
	<h1 class="text-4xl text-blue-500 my-4">Webcam Stream Mastery</h1>
	<button class="rounded-sm bg-slate-600 text-white px-4 py-2">Start Stream</button>
	<button class="rounded-sm bg-red-600 text-white px-4 py-2">Stop Stream</button>

	<video
		id="vid"
		class="mt-4 rounded-sm"
		width="640"
		height="480"
		autoplay={true}
		muted
		playsinline
		bind:this={videoRef}
	/>
	<canvas id="dst" class="mt-4 rounded-sm" width="640" height="480" />
</section>
