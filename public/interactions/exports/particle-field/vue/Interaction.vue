<script setup>
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {mount} from './core.js';
import './base.css';
import './style.css';
const props=defineProps({radius:{type:Number,default:__RADIUS__},strength:{type:Number,default:__STRENGTH__}});
const root=ref(null);let instance;
const values=()=>({radius:props.radius,strength:props.strength});
onMounted(()=>{instance=mount(root.value,values())});
watch(()=>[props.radius,props.strength],()=>instance?.update(values()));
onBeforeUnmount(()=>instance?.destroy());
</script>
<template><div ref="root" class="ms-interaction" /></template>
