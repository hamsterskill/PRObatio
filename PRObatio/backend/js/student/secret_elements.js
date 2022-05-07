const testbtn=document.querySelector('.test_btn');
const test = document.getElementById('test');
const act=document.querySelector('.main')

//отображение списка тестов
testbtn.addEventListener('click', () => {
    if (test.style.visibility == 'hidden') {
        test.style.visibility = 'visible';
        test.style.height='auto';
        test.style.marginBottom="10%";
    }
    else {   
        test.style.visibility = 'hidden';
        test.style.height=0; 
        test.style.marginBottom="auto";
    }    
});