<script>
	let p = [];
	let currentLight = '';
	function detect() {
		const img = document.getElementById('img');
		console.log('detecting');
		cocoSsd.load().then((model) => {
			model.detect(img).then((predictions) => {
				p = predictions;
			});
		});
		console.log(p);
	}
	function checkLight(p) {
		// Iterate through predictions and check if the class is traffic light, then check the color of the image within the corresponding bounding box coordinates
		for (let i = 0; i < p.length; i++) {
			if (p[i].class === 'traffic light') {
				const x1 = p[i].bbox[0];
				const y1 = p[i].bbox[1];
				const x2 = x1 + p[i].bbox[2];
				const y2 = y1 + p[i].bbox[3];
				const width = p[i].bbox[2];
				const height = p[i].bbox[3];

				const img = document.getElementById('img');

				const canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');

				canvas.width = img?.clientWidth;
				canvas.height = img?.clientHeight;
				canvas.style.borderWidth = '5px';
				canvas.style.borderColor = 'black';

				ctx.drawImage(img, x1, y1, width, height, x1, y1, width, height);
				document.body.appendChild(canvas);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const pixels = imageData.data;
				let redCount = 0;
				let yellowCount = 0;
				let greenCount = 0;

				for (let i = 0; i < pixels.length; i += 4) {
					const red = pixels[i];
					const green = pixels[i + 1];
					const blue = pixels[i + 2];
					if (red > 200 && green < 200) {
						// Red color
						redCount++;
					} else if (green > 200 && red < 200) {
						// Green color
						greenCount++;
					} else if (red > 100 && green > 100 && blue < 200) {
						// Yellow color
						yellowCount++;
					}
				}

				// Log the results
				// console.log('Red Count:', redCount);
				// console.log('Yellow Count:', yellowCount);
				// console.log('Green Count:', greenCount);

				if (redCount >= yellowCount && redCount >= greenCount) {
					currentLight = 'red';
				} else if (greenCount >= yellowCount && greenCount >= redCount) {
					currentLight = 'green';
				} else {
					currentLight = 'yellow';
				}
				console.log(currentLight);
			}
			// if (p[i].class === 'car' || p[i].class === 'truck') {
			// 	const x1 = p[i].bbox[0];
			// 	const y1 = p[i].bbox[1];
			// 	const width = p[i].bbox[2];
			// 	const height = p[i].bbox[3];

			// 	const img = document.getElementById('img');

			// 	const canvas = document.createElement('canvas');
			// 	var ctx = canvas.getContext('2d');

			// 	if (width > img?.clientWidth / 4 || height > img?.clientHeight / 4) {
			// 		console.log('close!');
			// 	}
			// 	canvas.width = img?.clientWidth;
			// 	canvas.height = img?.clientHeight;
			// 	canvas.style.borderWidth = '5px';
			// 	canvas.style.borderColor = 'black';

			// 	ctx.drawImage(img, x1, y1, width, height, x1, y1, width, height);
			// 	document.body.appendChild(canvas);
			// }
		}
	}
	//Write a function to check if a color contains more yellow, red, or green given x1, y1, x2, y2 the points for the bounding box in the image img
	// function checkColor(x1, y1, x2, y2) {
	//   const img = document.getElementById('img');
	//   const canvas = document.createElement('canvas');
	//   const ctx = canvas.getContext('2d');
	//   canvas.width = x2 - x1;
	//   canvas.height = y2 - y1;
	//   ctx.drawImage(img, x1, y1, x2 - x1, y2 - y1, 0, 0, x2 - x1, y2 - y1);
	//   document.body.appendChild(canvas);
	//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	//   const data = imageData.data;
	//   let red = 0;
	//   let green = 0;
	//   let yellow = 0;
	//   for (let i = 0; i < data.length; i += 4) {
	//     const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
	//     if (r > 200 && g > 200 && b < 100) {
	//       yellow++;
	//     } else if (r > 200 && g < 100 && b < 100) {
	//       red++;
	//     } else if (r < 100 && g > 200 && b < 100) {
	//       green++;
	//     }
	//   }
	//   if (red > green && red > yellow) {
	//     return 'Red';
	//   } else if (green > red && green > yellow) {
	//     return 'Green';
	//   } else {
	//     return 'Orange';
	//   }
	// }
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs">
	</script>
	<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd">
	</script>
</svelte:head>
<img id="img" src="yellowLight.webp" />

<!-- svelte-ignore missing-declaration -->
<button on:click={detect}>HELLO</button>
<p>{JSON.stringify(p)}</p>
<button on:click={checkLight(p)}>Check Light</button>
<div id="image-container">
	Hello
	<canvas id="imageCanvas"></canvas>
	Bye
</div>
