<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {mount} from './core.js';
import './base.css';
import './style.css';
const props=defineProps({angle:{type:Number,default:__ANGLE__},depth:{type:Number,default:__DEPTH__}});
const root=ref(null);let instance;
const values=()=>({angle:props.angle,depth:props.depth});
onMounted(()=>{instance=mount(root.value,values())});
watch(()=>[props.angle,props.depth],()=>instance?.update(values()));
onBeforeUnmount(()=>instance?.destroy());
</script>
<template><div ref="root" class="ms-interaction" /></template>
