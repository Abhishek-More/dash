
<script lang="ts">
    import { alert, angry, bleep, hooray } from "$lib/scripts/audio";
</script>

<button on:click={() => {alert.play()}}>Alert</button>
<button on:click={() => {angry.play()}}>Angry</button>
<button on:click={() => {bleep.play()}}>Bleep</button>
<button on:click={() => {hooray.play()}}>Hooray</button>
