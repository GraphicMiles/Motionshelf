<script>
import {onMount} from 'svelte';
import {mount} from './core.js';
import './base.css';
import './style.css';
export let duration=__DURATION__;
export let distance=__DISTANCE__;
let root,instance;
onMount(()=>{instance=mount(root,{duration, distance});return()=>instance?.destroy()});
$: if(instance) instance.update({duration, distance});
</script>
<div bind:this={root} class="ms-interaction"></div>
