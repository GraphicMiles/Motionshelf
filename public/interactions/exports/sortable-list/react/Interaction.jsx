import {useEffect,useRef} from 'react';
import {mount} from './core.js';
import './base.css';
import './style.css';

export default function Interaction({duration=__DURATION__, gap=__GAP__}){
 const root=useRef(null),instance=useRef(null);
 useEffect(()=>{instance.current=mount(root.current,{duration, gap});return()=>{instance.current?.destroy();instance.current=null}},[]);
 useEffect(()=>{instance.current?.update({duration, gap})},[duration, gap]);
 return <div ref={root} className="ms-interaction"/>;
}
