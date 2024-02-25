<script>
    import { onMount } from 'svelte';
	import cv from '@techstark/opencv-js';
	import { frameProcessor } from "$lib/scripts/lane_detection_bad";

    function process_lanes() {
        const img = document.getElementById('img');

        const canvas = document.createElement('canvas');
        const canvasGrayscale = document.createElement('canvas')
        canvas.width = img?.clientWidth;
        canvas.height = img?.clientHeight / 3;
        canvas.style.borderWidth = '5px';
        canvas.style.borderColor = 'black';
        var ctx = canvas.getContext('2d');
        var ctx2 = canvasGrayscale.getContext('2d')
        ctx.drawImage(img, 0, img.height * 2 / 3, img.width, img.height / 3, 0, 0, img?.clientWidth, img?.clientHeight / 3);
        document.body.appendChild(canvas);
        // Read the image from the canvas
        let src = cv.imread(canvas);
        let dst = new cv.Mat();
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(src, src, new cv.Size(5, 5), 0);
        cv.Canny(src, src, 50, 150, 3);
        
        // Find lines using HoughLines
        let lines = new cv.Mat();
        cv.HoughLines(src, lines, 1, Math.PI / 180, 75, 0, 0, 0, Math.PI);

        // Draw lines on the original image
        let checked = []
        for (let i = 0; i < lines.rows; ++i) {
            if (!(checked.includes(i))) {
                checked.push(i)
                let rho = lines.data32F[i * 2];
                let theta = lines.data32F[i * 2 + 1];
                let a = Math.cos(theta);
                let b = Math.sin(theta);
                let x0 = a * rho;
                let y0 = b * rho;
                let pt1 = { x: Math.round(x0 + 1000 * (-b)), y: Math.round(y0 + 1000 * (a)) };
                let pt2 = { x: Math.round(x0 - 1000 * (-b)), y: Math.round(y0 - 1000 * (a)) };
                console.log(i, pt1.x, pt2.x, pt1.y, pt2.y)
                for (let j = i + 1; j < lines.rows; ++j) {
                    if (!(checked.includes(j))) {
                        let rho2 = lines.data32F[j * 2];
                        let theta2 = lines.data32F[j * 2 + 1];
                        let a2 = Math.cos(theta2);
                        let b2 = Math.sin(theta2);
                        let x02 = a2 * rho2;
                        let y02 = b2 * rho2;
                        let pt3 = { x: Math.round(x02 + 1000 * (-b2)), y: Math.round(y02 + 1000 * (a2)) };
                        let pt4 = { x: Math.round(x02 - 1000 * (-b2)), y: Math.round(y02 - 1000 * (a2)) };
                        if (Math.sqrt(Math.sqrt((pt1.x - pt3.x) ** 2 + (pt1.y - pt3.y) ** 2) + Math.sqrt((pt2.x - pt4.x) ** 2 + (pt2.y - pt4.y) ** 2)) < img?.clientWidth * 0.03 ) {
                            checked.push(j)
                        }
                        
                    }
                }
                if (Math.abs(pt1.y - pt2.y) > img?.clientHeight * 0.2) {
                     // Draw lines on the canvas
                    ctx.beginPath();
                    ctx.moveTo(pt1.x, pt1.y);
                    ctx.lineTo(pt2.x, pt2.y);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    if ((pt1.x > img?.clientWidth * 0.0) && (pt1.x < img?.clientWidth * 1) && (pt2.x > img?.clientWidth * 0) && (pt2.x < img?.clientWidth * 1)) {
                        console.log("UR ASS IS IN THE MIDDLE OF THE LANE")
                    }
                }
               
            }
        }
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

<img id="img" src="lane_example6.jpeg" />

<button on:click={process_lanes}>process</button>
