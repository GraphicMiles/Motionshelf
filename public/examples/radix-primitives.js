const edit=document.getElementById('edit'),backdrop=document.getElementById('backdrop'),dialog=backdrop.querySelector('[role=dialog]'),nameInput=document.getElementById('name');
function open(){backdrop.hidden=false;nameInput.value=document.getElementById('profile-name').textContent;nameInput.focus();nameInput.select()}
function close(){backdrop.hidden=true;edit.focus()}
edit.addEventListener('click',open);document.getElementById('close').addEventListener('click',close);document.getElementById('cancel').addEventListener('click',close);backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
backdrop.addEventListener('keydown',e=>{if(e.key==='Escape'){close();return}if(e.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,input')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
document.getElementById('profile-form').addEventListener('submit',e=>{e.preventDefault();if(!nameInput.value.trim()){nameInput.setCustomValidity('Enter a name');nameInput.reportValidity();return}nameInput.setCustomValidity('');document.getElementById('profile-name').textContent=nameInput.value.trim();document.getElementById('message').textContent='Profile updated';close()});nameInput.addEventListener('input',()=>nameInput.setCustomValidity(''));

document.body.dataset.ready='true';
