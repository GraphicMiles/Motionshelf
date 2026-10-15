<script>
import {onMount} from 'svelte';
import {mount} from './core.js';
import './base.css';
import './style.css';
export let angle=__ANGLE__;
export let depth=__DEPTH__;
let root,instance;
onMount(()=>{instance=mount(root,{angle, depth});return()=>instance?.destroy()});
$: if(instance) instance.update({angle, depth});
</script>
<div bind:this={root} class="ms-interaction"></div>
