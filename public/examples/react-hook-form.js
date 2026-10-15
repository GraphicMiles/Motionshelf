const form=document.getElementById('email-form'),input=document.getElementById('email'),feedback=document.getElementById('feedback');
form.addEventListener('submit',event=>{event.preventDefault();const valid=input.value.trim()!==''&&input.validity.valid;input.setAttribute('aria-invalid',String(!valid));feedback.classList.toggle('valid',valid);feedback.textContent=valid?'Address looks valid':'Enter a valid email address'});input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');feedback.textContent='';feedback.classList.remove('valid')});

document.body.dataset.ready='true';
