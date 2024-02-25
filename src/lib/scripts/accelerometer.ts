
// https://yari-demos.prod.mdn.mozit.cloud/en-US/docs/Web/API/Device_orientation_events/Detecting_device_orientation/_sample_.Orientation_example.html
// https://trekhleb.dev/blog/2021/gyro-web/

// THIS MUST BE ON A PAGE WITH HTTPS OR ELSE ACCELEROMETER AND GYROSCOPE PERMISSION CANNOT BE GRANTED (or even be prompted to be granted)

export function initializeAccelerometer(handleMotionFunction: (event: DeviceMotionEvent) => void){


    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // Handle iOS 13+ devices.
        DeviceMotionEvent.requestPermission()
        .then((state) => {
            if (state === 'granted') {
            // lastTime = Date.now()
            window.addEventListener('devicemotion', handleMotionFunction);
            } else {
            // document.body.innerText = state
            }
        })
        .catch((reason) => {
            // document.body.innerText = reason
        });
    } else {
        // Handle regular non iOS 13+ devices.
        // lastTime = Date.now()
        window.addEventListener('devicemotion', handleMotionFunction);
    }

}

// function handleMotion(event) {

//     const x_acc = event.acceleration.x;  // Left and right
//     const y_acc = event.acceleration.y;  // Up and down
//     const z_acc = event.acceleration.z;  // Into and out of screen

//     document.getElementById("x-acc").innerText = x_acc;
//     document.getElementById("y-acc").innerText = y_acc;
//     document.getElementById("z-acc").innerText = z_acc;

// }








