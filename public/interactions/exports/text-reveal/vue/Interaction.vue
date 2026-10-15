<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {mount} from './core.js';
import './base.css';
import './style.css';
const props=defineProps({duration:{type:Number,default:__DURATION__},stagger:{type:Number,default:__STAGGER__}});
const root=ref(null);let instance;
const values=()=>({duration:props.duration,stagger:props.stagger});
onMounted(()=>{instance=mount(root.value,values())});
watch(()=>[props.duration,props.stagger],()=>instance?.update(values()));
onBeforeUnmount(()=>instance?.destroy());
</script>
<template><div ref="root" class="ms-interaction" /></template>
