const fold=document.querySelector('#fold'),middle=document.querySelector('#middle'),status=document.querySelector('#status');document.querySelector('#expand').addEventListener('click',()=>{fold.hidden=true;middle.hidden=false;status.textContent='Full breadcrumb path shown';middle.querySelector('a').focus()});

document.body.dataset.ready="true";
