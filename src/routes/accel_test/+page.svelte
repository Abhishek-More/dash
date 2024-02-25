<script lang="ts">
    import { initializeAccelerometer } from '$lib/scripts/accelerometer.ts';

    let x_acc = 0;
    let y_acc = 0;
    let z_acc = 0;

    let max_x_acc = 0;
    let max_y_acc = 0;
    let max_z_acc = 0;

    function handleMotion(event: DeviceMotionEvent) {

        x_acc = event.acceleration.x;  // Left and right
        y_acc = event.acceleration.y;  // Up and down
        z_acc = event.acceleration.z;  // Into and out of screen

        if (Math.abs(x_acc) > Math.abs(max_x_acc)) {
            max_x_acc = x_acc;
        }
        if (Math.abs(y_acc) > Math.abs(max_y_acc)) {
            max_y_acc = y_acc;
        }
        if (Math.abs(z_acc) > Math.abs(max_z_acc)) {
            max_z_acc = z_acc;
        }
    }
</script>

<button on:click={() => {initializeAccelerometer(handleMotion)}}>START</button>

<p> x: {x_acc} </p>
<p> y: {y_acc} </p>
<p> z: {z_acc} </p>
<br>
<p> max x: {max_x_acc} </p>
<p> max y: {max_y_acc} </p>
<p> max z: {max_z_acc} </p>



