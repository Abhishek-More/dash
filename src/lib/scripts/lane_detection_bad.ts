// import cv from '@techstark/opencv-js';


// function calculateWeightedSum(lines, weights) {
//     let weightedSum = [0, 0]; // [sum of slopes, sum of intercepts]
//     for (let i = 0; i < lines.length; i++) {
//         const [slope, intercept] = lines[i];
//         const weight = weights[i];
//         weightedSum[0] += slope * weight; // Update sum of slopes
//         weightedSum[1] += intercept * weight; // Update sum of intercepts
//     }
//     return weightedSum;
// }

// // function averageSlopeIntercept(lines) {
// //     let leftLines = [];
// //     let leftWeights = [];
// //     let rightLines = [];
// //     let rightWeights = [];

// //     for (let i = 0; i < lines.rows; i++) {
// //         const [x1, y1, x2, y2] = lines.data32S.subarray(i * 4, i * 4 + 4);
// //         const slope = (y2 - y1) / (x2 - x1);
// //         const intercept = y1 - (slope * x1);
// //         const length = Math.sqrt(Math.pow((y2 - y1), 2) + Math.pow((x2 - x1), 2));
// //         if (slope < 0) {
// //             leftLines.push([slope, intercept]);
// //             leftWeights.push(length);
// //         } else {
// //             rightLines.push([slope, intercept]);
// //             rightWeights.push(length);
// //         }
// //     }

// //     // Calculate the weighted sum of slopes and intercepts for left and right lanes
// //     const leftWeightedSum = calculateWeightedSum(leftLines, leftWeights);
// //     const rightWeightedSum = calculateWeightedSum(rightLines, rightWeights);

// //     // Calculate the average slope and intercept for left and right lanes
// //     const leftLane = leftWeights.length > 0 ? leftWeightedSum[1] / leftWeights.reduce((a, b) => a + b, 0) : null;
// //     const rightLane = rightWeights.length > 0 ? rightWeightedSum[1] / rightWeights.reduce((a, b) => a + b, 0) : null;

// //     return [leftLane, rightLane];
// // }

// function averageSlopeAndInterceptLeftAndRight(lines) {
//     let leftLines = [];
//     let leftWeights = [];
//     let rightLines = [];
//     let rightWeights = [];

//     for (let i = 0; i < lines.rows; i++) {
//         const [x1, y1, x2, y2] = lines.data32S.subarray(i * 4, i * 4 + 4);
//         const slope = (y2 - y1) / (x2 - x1);
//         const intercept = y1 - (slope * x1);
//         const length = Math.sqrt(Math.pow((y2 - y1), 2) + Math.pow((x2 - x1), 2));
//         if (slope < 0) {
//             leftLines.push([slope, intercept]);
//             leftWeights.push(length);
//         } else {
//             rightLines.push([slope, intercept]);
//             rightWeights.push(length);
//         }
//     }

//     // Calculate the weighted sum of slopes and intercepts for left and right lanes
//     const leftWeightedSum = calculateWeightedSum(leftLines, leftWeights);
//     const rightWeightedSum = calculateWeightedSum(rightLines, rightWeights);

//     // Calculate both the average slope and intercept for left and right lanes
//     const leftLane = leftWeights.length > 0 ? [leftWeightedSum[0] / leftWeights.reduce((a, b) => a + b, 0), leftWeightedSum[1] / leftWeights.reduce((a, b) => a + b, 0)] : null;
//     const rightLane = rightWeights.length > 0 ? [rightWeightedSum[0] / rightWeights.reduce((a, b) => a + b, 0), rightWeightedSum[1] / rightWeights.reduce((a, b) => a + b, 0)] : null;

//     return [leftLane, rightLane];
// }
    


// function pixelPoints(y1, y2, line) {
//     // if (!line) {
//     //     return null;
//     // }
//     // const [slope, intercept] = line;
//     // const x1 = parseInt((y1 - intercept) / slope);
//     // const x2 = parseInt((y2 - intercept) / slope);
//     // return [[x1, y1], [x2, y2]];

//     if (!line) {
//         return null;
//     }
//     const [slope, intercept] = line;
//     const x1 = parseInt((y1 - intercept) / slope);
//     const x2 = parseInt((y2 - intercept) / slope);
//     return [[x1, y1], [x2, y2]];
// }

// function laneLines(image, lines) {
//     // const [leftLane, rightLane] = averageSlopeIntercept(lines);
//     // const y1 = image.sizes[0];
//     // const y2 = y1 * 0.6;
//     // const leftLine = pixelPoints(y1, y2, leftLane);
//     // const rightLine = pixelPoints(y1, y2, rightLane);
//     // return [leftLine, rightLine];

//     const [leftLane, rightLane] = averageSlopeIntercept(lines);
//     const y1 = image.rows;
//     const y2 = y1 * 0.6;
//     const leftLine = pixelPoints(y1, y2, leftLane);
//     const rightLine = pixelPoints(y1, y2, rightLane);
//     return [leftLine, rightLine];
// }

// function drawLaneLines(image, lines, color = new cv.Vec(255, 0, 0), thickness = 12) {
//     const lineImage = new cv.Mat(image.rows, image.cols, cv.CV_8UC3, [0, 0, 0]);
//     for (const line of lines) {
//         if (line) {
//             const pt1 = new cv.Point(line[0][0], line[0][1]);
//             const pt2 = new cv.Point(line[1][0], line[1][1]);
//             lineImage.drawLine(pt1, pt2, color, thickness);
//         }
//     }
//     return cv.addWeighted(image, 1.0, lineImage, 1.0, 0.0);
// }

// function detectLines(image: cv.Mat) {
//     // // Distance resolution of the accumulator in pixels.
//     // const rho = 1;
//     // // Angle resolution of the accumulator in radians.
//     // const theta = Math.PI / 180;
//     // // Only lines that are greater than threshold will be returned.
//     // const thresh = 20;
//     // // Line segments shorter than that are rejected.
//     // const minLineLength = 20;
//     // // Maximum allowed gap between points on the same line to link them
//     // const maxLineGap = 500;
//     // // function returns an array containing dimensions of straight lines
//     // // appearing in the input image
//     // return cv.HoughLinesP(image, , rho, theta, thresh, minLineLength, maxLineGap);

//     const lines = new cv.Mat();
//     cv.HoughLinesP(image, lines, 1, Math.PI / 180, 50, 50, 10);
//     return lines;
// }

// function regionSelection(image: cv.Mat) {
//     // // Crop out the top half of the image
//     // const region = image.roi(new cv.Rect(0, image.rows * 0.5, image.cols, image.rows * 0.5));
//     // // Create a mask for the region of interest
//     // const mask = new cv.Mat(region.rows, region.cols, cv.CV_8UC1);
//     // // Create a triangle mask
//     // const triangle = new cv.Mat(region.rows, region.cols, cv.CV_8UC1);
//     // const triangleContour = new cv.MatVector();
//     // triangleContour.push_back(new cv.Mat([new cv.Point(region.cols * 0.5, 0), new cv.Point(region.cols, region.rows), new cv.Point(0, region.rows)]));
//     // cv.fillPoly(triangle, triangleContour, [255]);
//     // // Copy the triangle mask to the mask
//     // triangle.copyTo(mask.roi(new cv.Rect(0, 0, region.cols, region.rows)));
//     // // Apply the mask to the region
//     // const masked = new cv.Mat();
//     // cv.bitwise_and(region, region, masked, mask);
//     // return masked;

//     const region = image.roi(new cv.Rect(0, image.rows * 0.5, image.cols, image.rows * 0.5));
//     const mask = new cv.Mat(region.rows, region.cols, cv.CV_8UC1);
//     const masked = new cv.Mat();
//     cv.bitwise_and(region, region, masked, mask);
//     return masked;
// }

// export function frameProcessor(image) {
//     let grayscale = new cv.Mat();
//     cv.cvtColor(image, grayscale, cv.COLOR_BGR2GRAY);
//     // const grayscale = image.cvtColor(cv.COLOR_BGR2GRAY);

//     // blur for denoising n stuff
//     const blurKernelSize = new cv.Size(5, 5);
//     cv.GaussianBlur(grayscale, grayscale, blurKernelSize, 0);
//     // const blur = grayscale.gaussianBlur(blurKernelSize, 0);

//     // canny edge detection
//     const lowThresh = 50;
//     const highThresh = 150;
//     cv.Canny(grayscale, grayscale, lowThresh, highThresh);
//     // const edges = blur.canny(lowThresh, highThresh);

//     // only select the road as the region of interest
//     const region = regionSelection(grayscale);

//     // get the straight lines from the image using hough transform
//     const lineDetect = detectLines(region);
//     // console.log(lineDetect);

//     // draw the lane lines on the original image
//     return drawLaneLines(image, laneLines(image, lineDetect));




//     // draw the lane lines on the original image
//     // return drawLaneLines(image, laneLines(image, lineDetect));
// }




export function frameProcessor(image) {

}


