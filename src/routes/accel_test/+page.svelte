<script lang="ts">
    import { initializeAccelerometer } from '$lib/scripts/accelerometer.ts';

    let x_acc = 0;
    let y_acc = 0;
    let z_acc = 0;

    function handleMotion(event: DeviceMotionEvent) {

        x_acc = event.acceleration.x;  // Left and right
        y_acc = event.acceleration.y;  // Up and down
        z_acc = event.acceleration.z;  // Into and out of screen
    }
</script>

<button on:click={() => {initializeAccelerometer(handleMotion)}}>START</button>

<p> x: {x_acc} </p>
<p> y: {y_acc} </p>
<p> z: {z_acc} </p>


