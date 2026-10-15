let count=2;const output=document.getElementById('count'),down=document.getElementById('down');
function render(){output.value=String(count).padStart(2,'0');output.textContent=output.value;down.disabled=count===0}
document.getElementById('up').addEventListener('click',()=>{count++;render()});down.addEventListener('click',()=>{count=Math.max(0,count-1);render()});document.getElementById('reset').addEventListener('click',()=>{count=2;render()});render();

document.body.dataset.ready='true';
