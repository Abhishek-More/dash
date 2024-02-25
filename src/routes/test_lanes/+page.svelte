<script>
    import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';
	import { frameProcessor } from "$lib/scripts/lane_detection_bad";

    function process_lanes() {
        const img = document.getElementById('img');

        const canvas = document.createElement('canvas');
        const canvasGrayscale = document.createElement('canvas')
        canvas.width = img?.clientWidth;
        canvas.height = img?.clientHeight;
        canvas.style.borderWidth = '5px';
        canvas.style.borderColor = 'black';
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        document.body.appendChild(canvas);
        // Read the image from the canvas
        let src = cv.imread(canvas);
        let dst = new cv.Mat();
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(src, src, new cv.Size(5, 5), 0);
        
        cv.Canny(src, src, 50, 150, 3);
        
        cv.imshow(canvasGrayscale, src);
        src.delete();
        dst.delete();
        document.body.appendChild(canvasGrayscale);

    }
    function contour_mode() {
        const img = document.getElementById('img');

        const canvas = document.createElement('canvas');
        const canvasGrayscale = document.createElement('canvas')
        canvas.width = img?.clientWidth;
        canvas.height = img?.clientHeight;
        canvas.style.borderWidth = '5px';
        canvas.style.borderColor = 'black';
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        document.body.appendChild(canvas);
        // Read the image from the canvas
        let src = cv.imread(canvas);
        let dst = new cv.Mat();
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(src, src, new cv.Size(5, 5), 0);
        
        cv.Canny(src, src, 50, 150, 3);
        
        cv.imshow(canvasGrayscale, src);
        src.delete();
        dst.delete();
        document.body.appendChild(canvasGrayscale);

    }
</script>
<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs">
	</script>
	<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd">
	</script>
</svelte:head>

<img id="img" src="lane_example1.jpeg" />

<!-- svelte-ignore missing-declaration -->
<button on:click={process_lanes}>process</button>
<div id="image-container">
	
	<canvas id="imageCanvas"></canvas>
</div>