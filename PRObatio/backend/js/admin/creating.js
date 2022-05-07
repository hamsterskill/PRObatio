const div_if =  document.querySelector('.if');
let role=document.getElementById('role');
const relation=document.getElementById('relation');
const relation_name=document.getElementById('relation_name'); 
let list_of_students = document.getElementById('list_of_students')
const list_of_teachers=document.getElementById('list_of_teachers')

// в зависимости от роли открываются новые поля для заполнения
role.addEventListener('click', () => {
    if (role.value=='Студент') {
        div_if.style.visibility = 'visible';
        div_if.style.height="auto";
        relation_name.innerText ='Назначить Преподавателей';
        relation.style.visibility = 'visible';
        relation.style.height='auto';
        list_of_teachers.style.visibility = 'visible';
        list_of_teachers.style.width="100%";
        list_of_students.style.visibility = 'hidden';
        list_of_students.style.width=0;
    }
    
        if (role.value=='Преподаватель') {
            div_if.style.visibility = 'hidden';
            div_if.style.height=0;
            list_of_teachers.style.visibility = 'hidden';
            list_of_teachers.style.width=0;
            relation_name.innerText ='Назначить Студентов';
            relation.style.visibility = 'visible';
            relation.style.height='auto';  
            list_of_students.style.visibility = 'visible';
            list_of_students.style.width='100%';
            }
            if (role.value=='Администратор') {
            div_if.style.visibility = 'hidden';
            div_if.style.height=0;
            list_of_teachers.style.visibility = 'hidden';
            list_of_teachers.style.width=0;
            relation.style.visibility = 'hidden';
            relation.style.height=0;
            list_of_teachers.style.width=0;
           list_of_students.style.visibility = 'hidden';
        list_of_students.style.width=0;
         
        }
    

});
