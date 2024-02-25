<script lang="ts">
    import { initializeAccelerometer } from '$lib/scripts/accelerometer.ts';

    let accelerometerInitialized = false;
    let crashDetected = false;

    let name = "Naveen Iyer";
    let phoneNumber = "";

    async function handleMotion(event: DeviceMotionEvent) {
        if (Math.abs(event.acceleration.x) > 170 || Math.abs(event.acceleration.y) > 170 || Math.abs(event.acceleration.z) > 170) {
            crashDetected = true;
            
            await fetch('/api/crash-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    phoneNumber: phoneNumber,
                    location: "College Station, TX"
                })
            });
        }
    }
</script>

<button on:click={() => {initializeAccelerometer(handleMotion); accelerometerInitialized = true}}>START</button>

{#if accelerometerInitialized}
    <h1 class="text-xl">Ready!</h1>
{:else}
    <h1 class="text-xl">Please initialize accelerometer</h1>
{/if}

<input type="text" bind:value={phoneNumber} placeholder="Enter phone number" class="border-2 border-black" />
<input type="text" bind:value={name} placeholder="Enter name" class="border-2 border-black" />

{#if crashDetected}
    <h1 class="text-6xl text-white bg-red-600">CRASH DETECTED</h1>
{/if}


