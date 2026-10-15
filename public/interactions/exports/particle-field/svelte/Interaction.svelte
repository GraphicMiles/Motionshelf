<script>
import {onMount} from 'svelte';
import {mount} from './core.js';
import './base.css';
import './style.css';
export let radius=__RADIUS__;
export let strength=__STRENGTH__;
let root,instance;
onMount(()=>{instance=mount(root,{radius, strength});return()=>instance?.destroy()});
$: if(instance) instance.update({radius, strength});
</script>
<div bind:this={root} class="ms-interaction"></div>
