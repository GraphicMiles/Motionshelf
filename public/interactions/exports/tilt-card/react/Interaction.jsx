import {useEffect,useRef} from 'react';
import {mount} from './core.js';
import './base.css';
import './style.css';

export default function Interaction({angle=__ANGLE__, depth=__DEPTH__}){
 const root=useRef(null),instance=useRef(null);
 useEffect(()=>{instance.current=mount(root.current,{angle, depth});return()=>{instance.current?.destroy();instance.current=null}},[]);
 useEffect(()=>{instance.current?.update({angle, depth})},[angle, depth]);
 return <div ref={root} className="ms-interaction"/>;
}
