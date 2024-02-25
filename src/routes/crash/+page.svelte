<script lang="ts">
    import { initializeAccelerometer } from '$lib/scripts/accelerometer.ts';

    let accelerometerInitialized = false;
    let crashDetected = false;

    function handleMotion(event: DeviceMotionEvent) {
        if (Math.abs(event.acceleration.x) > 200 || Math.abs(event.acceleration.y) > 200 || Math.abs(event.acceleration.z) > 200) {
            crashDetected = true;
        }
    }
</script>

<button on:click={() => {initializeAccelerometer(handleMotion); accelerometerInitialized = true}}>START</button>

{#if accelerometerInitialized}
    <h1 class="text-xl">Ready!</h1>
{:else}
    <h1 class="text-xl">Please initialize accelerometer</h1>
{/if}

{#if crashDetected}
    <h1 class="text-6xl text-white bg-red-600">CRASH DETECTED</h1>
{/if}


