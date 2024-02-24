<script>
    import { onMount } from 'svelte';

    let stream;
    let videoRef;

    onMount(async () => {
      let video = document.getElementById('vid');
      video.style.width = document.width + 'px';
      video.style.height = document.height + 'px';
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment"},
          audio: false
      });
      videoRef.srcObject = stream;
    });

  
</script>
<section class="container mx-auto px-4">
    <h1 class="text-4xl text-blue-500 my-4">Webcam Stream Mastery</h1>
    <button class="rounded-sm bg-slate-600 text-white px-4 py-2">Start Stream</button>
    <button class="rounded-sm bg-red-600 text-white px-4 py-2">Stop Stream</button>

    <video id="vid" class="mt-4 rounded-sm " width="640" height="480" autoplay={true} muted playsinline bind:this={videoRef} />

</section>