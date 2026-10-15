const orb=document.querySelector('.orb'),status=document.getElementById('status'),button=document.getElementById('replay');let timer;
function play(){orb.classList.remove('playing');void orb.offsetWidth;orb.classList.add('playing');status.textContent='Playing';clearTimeout(timer);timer=setTimeout(()=>status.textContent='Ready to replay',950)}
button.addEventListener('click',play);requestAnimationFrame(play);

document.body.dataset.ready='true';
