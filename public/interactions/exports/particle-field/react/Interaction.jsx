import {useEffect,useRef} from 'react';
import {mount} from './core.js';
import './base.css';
import './style.css';

export default function Interaction({radius=__RADIUS__, strength=__STRENGTH__}){
 const root=useRef(null),instance=useRef(null);
 useEffect(()=>{instance.current=mount(root.current,{radius, strength});return()=>{instance.current?.destroy();instance.current=null}},[]);
 useEffect(()=>{instance.current?.update({radius, strength})},[radius, strength]);
 return <div ref={root} className="ms-interaction"/>;
}
