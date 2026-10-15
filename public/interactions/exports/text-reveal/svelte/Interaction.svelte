<script>
import {onMount} from 'svelte';
import {mount} from './core.js';
import './base.css';
import './style.css';
export let duration=__DURATION__;
export let stagger=__STAGGER__;
let root,instance;
onMount(()=>{instance=mount(root,{duration, stagger});return()=>instance?.destroy()});
$: if(instance) instance.update({duration, stagger});
</script>
<div bind:this={root} class="ms-interaction"></div>
