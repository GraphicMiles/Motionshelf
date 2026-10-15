const input=document.querySelector('#code'),status=document.querySelector('#status');input.addEventListener('input',()=>{const cleaned=input.value.replace(/[^0-9]/g,'').slice(0,6);if(input.value!==cleaned)input.value=cleaned;status.textContent=cleaned.length===6?'Code complete':cleaned.length+' of 6 digits entered'});

document.body.dataset.ready="true";
