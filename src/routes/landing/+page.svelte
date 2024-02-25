<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import IoMdCar from 'svelte-icons/io/IoMdCar.svelte';
</script>

<main class="flex flex-col items-center justify-center w-full h-dvh gap-4">
	<div class="flex items-center gap-4">
		<h1 class="scroll-m-20 text-6xl font-extrabold lg:text-8xl">dash</h1>
		<span class="w-20 lg:w-32">
			<IoMdCar />
		</span>
	</div>
	<p class="scroll-m-20 text-lg lg:text-xl">Drive with your phone.</p>
	<Button href="/" variant="destructive" size="lg">Start Drive</Button>
</main>
