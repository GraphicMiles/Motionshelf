const button=document.getElementById('sort-name'),body=document.getElementById('members'),rows=[...body.rows];let ascending=true;
button.addEventListener('click',()=>{ascending=!ascending;rows.sort((a,b)=>ascending?a.dataset.name.localeCompare(b.dataset.name):b.dataset.name.localeCompare(a.dataset.name));body.replaceChildren(...rows);document.getElementById('name-column').setAttribute('aria-sort',ascending?'ascending':'descending');button.setAttribute('aria-label',`Sort names ${ascending?'descending':'ascending'}`);document.getElementById('arrow').className=ascending?'fa-solid fa-arrow-down':'fa-solid fa-arrow-up';document.getElementById('sort-status').textContent=`Names sorted ${ascending?'ascending':'descending'}`});

document.body.dataset.ready='true';
