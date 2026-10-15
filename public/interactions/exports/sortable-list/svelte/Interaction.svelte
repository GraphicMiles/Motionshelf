<script>
import {onMount} from 'svelte';
import {mount} from './core.js';
import './base.css';
import './style.css';
export let duration=__DURATION__;
export let gap=__GAP__;
let root,instance;
onMount(()=>{instance=mount(root,{duration, gap});return()=>instance?.destroy()});
$: if(instance) instance.update({duration, gap});
</script>
<div bind:this={root} class="ms-interaction"></div>
