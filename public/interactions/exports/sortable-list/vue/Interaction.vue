<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {mount} from './core.js';
import './base.css';
import './style.css';
const props=defineProps({duration:{type:Number,default:__DURATION__},gap:{type:Number,default:__GAP__}});
const root=ref(null);let instance;
const values=()=>({duration:props.duration,gap:props.gap});
onMounted(()=>{instance=mount(root.value,values())});
watch(()=>[props.duration,props.gap],()=>instance?.update(values()));
onBeforeUnmount(()=>instance?.destroy());
</script>
<template><div ref="root" class="ms-interaction" /></template>
