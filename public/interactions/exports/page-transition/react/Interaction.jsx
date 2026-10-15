import {useEffect,useRef} from 'react';
import {mount} from './core.js';
import './base.css';
import './style.css';

export default function Interaction({duration=__DURATION__, distance=__DISTANCE__}){
 const root=useRef(null),instance=useRef(null);
 useEffect(()=>{instance.current=mount(root.current,{duration, distance});return()=>{instance.current?.destroy();instance.current=null}},[]);
 useEffect(()=>{instance.current?.update({duration, distance})},[duration, distance]);
 return <div ref={root} className="ms-interaction"/>;
}
