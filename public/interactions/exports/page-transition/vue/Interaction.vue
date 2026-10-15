<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {mount} from './core.js';
import './base.css';
import './style.css';
const props=defineProps({duration:{type:Number,default:__DURATION__},distance:{type:Number,default:__DISTANCE__}});
const root=ref(null);let instance;
const values=()=>({duration:props.duration,distance:props.distance});
onMounted(()=>{instance=mount(root.value,values())});
watch(()=>[props.duration,props.distance],()=>instance?.update(values()));
onBeforeUnmount(()=>instance?.destroy());
</script>
<template><div ref="root" class="ms-interaction" /></template>
