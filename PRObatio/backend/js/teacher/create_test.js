const time=document.getElementById('time')
const timer=document.getElementById('timer')
const att=document.getElementById('attempts')
const q_a=document.getElementById('quantity_attempts')
let add_q=document.getElementById('add_question')
let list_q=document.getElementById('list_of_questions')
let count =1
let c_a=1

//отображение/скрытие полей ввода для таймера при наличии/отсутствии ограничения по времени
time.addEventListener('click', (event) => {
    if (time.value=='off') {
        timer.style.visibility='visible'
        timer.style.height='auto'
        time.value='on'
    }
    else {
        timer.style.visibility='hidden'
        timer.style.height=0
        time.value='off'
    }
})

//отображение/скрытие полей ввода для количества попыток при наличии/отсутствии ограничения по их количество
att.addEventListener('click', (event) => {
    if (att.value=='off') {
        q_a.style.visibility='visible'
        q_a.style.height='auto'
        att.value='on'
    }
    else {
        q_a.style.visibility='hidden'
        q_a.style.height=0
        att.value='off'
    }
})

//Добавление вопроса
add_q.addEventListener('click', (event)=>{
    count+=1
    c_a+=1
    let num_q='question'+count

    //создание элемента списка для вопроса
    let new_li=document.createElement('li')
    new_li.setAttribute('class', 'question')
    new_li.setAttribute('name', num_q)
    
    // создание вопроса
    let new_question=document.createElement('input')
    new_question.setAttribute('placeholder', "Введите вопрос")
    new_question.setAttribute('name', num_q)
    new_question.setAttribute('class', 'item form_group_item_second')
    
    //создание списка ответов
    let new_ol=document.createElement('ol')
    new_ol.setAttribute('class', 'answers')
    
    //создание элемента списка ответов
    let li_ans=document.createElement('li')
    li_ans.setAttribute('class', 'answer')
    let num_a=num_q+'ans'+c_a
    li_ans.setAttribute('name', num_a)

    //создание варианта ответа
    let new_answer=document.createElement('input')
    new_answer.setAttribute('placeholder', "Введите ответ")
    new_answer.setAttribute('class', 'item form_group_item_second')
    new_answer.setAttribute('name', num_a)
    let check_answer=document.createElement('input')
    check_answer.setAttribute('type', "checkbox")
    check_answer.setAttribute('class', "checkbox")
    check_answer.setAttribute('name', num_a)
    let text_answer=document.createElement('text')
    text_answer.textContent='Правильный ответ'

    //создание кнопки для добавления варианта
    let add_answer=document.createElement('p')
    add_answer.textContent= 'Добавить вариант ответа'
    add_answer.setAttribute('name', 'add_answer')
    add_answer.setAttribute('class', 'btn')

    //добавление элементов друг в друга
    new_li.appendChild(new_question)
    new_ol.appendChild(add_answer)
    li_ans.appendChild(new_answer)
    li_ans.appendChild(text_answer)
    li_ans.appendChild(check_answer)
    new_ol.appendChild(li_ans)
    new_li.appendChild(new_ol)
    list_q.appendChild(new_li)
})

//добавление варианта ответа
list_q.onclick = function(event) {
    
    let target = event.target; // где был клик?
    if (target.tagName != 'P') return; // не на P? тогда не интересует

    c_a+=1
    var name = event.target.closest('li').getAttribute('name')
    let num_a=name+'ans'+c_a
    let ol_ans=target.closest('ol')

    //создание варианта ответа
    let new_answer=document.createElement('input')
    new_answer.setAttribute('placeholder', "Введите ответ")
    new_answer.setAttribute('class', 'item form_group_item_second')
    new_answer.setAttribute('name', num_a)
    let check_answer=document.createElement('input')
    check_answer.setAttribute('type', "checkbox")
    check_answer.setAttribute('class', "checkbox")
    check_answer.setAttribute('name', num_a)
    let text_answer=document.createElement('text')
    text_answer.textContent='Правильный ответ'
    
    //создание элемента списка ответов
    let li_ans=document.createElement('li')
    li_ans.setAttribute('class', 'answer')
    li_ans.setAttribute('name', count+1)

    // добавление элементов
    li_ans.appendChild(new_answer)
    li_ans.appendChild(text_answer)
    li_ans.appendChild(check_answer)
    ol_ans.appendChild(li_ans)
    
  };