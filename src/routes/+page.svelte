<script lang="ts">
	import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';

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

				console.log(p);

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
				}
			} catch (error) {
				console.error('Error processing video:', error);
			}
		}

		// Start processing video
		setInterval(processVideo, 100);
	});
</script>

<section class="container mx-auto px-4">
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
