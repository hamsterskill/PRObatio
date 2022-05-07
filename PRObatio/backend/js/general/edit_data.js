const editbtn = document.querySelector('.edit_btn');
const input =  document.querySelectorAll('.edit_item');
const savebtn=document.querySelector('.save_btn')

//переход в режим редактирования
editbtn.addEventListener('click', (event) => {    
    input.forEach((item) => {
            item.style.visibility = 'visible'
        });
    savebtn.style.width='auto'
    savebtn.style.visibility='visible'
    savebtn.style.height='auto' 
    editbtn.style.width=0
    editbtn.style.visibility='hidden'
    editbtn.style.height=0  
});

//выход из режима редактирования
savebtn.addEventListener('click', (event) => { 
    input.forEach((item) => {
            item.style.visibility = 'hidden'
        });
    editbtn.style.width='auto'
    editbtn.style.visibility='visible'
    editbtn.style.height='auto' 
    savebtn.style.width=0
    savebtn.style.visibility='hidden'
    savebtn.style.height=0  
});
