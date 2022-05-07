const {Router} = require('express')
const router = Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Math=require('math')
const { Pool } = require('pg');
const { toArray} = require('list');
const {reset, send_info} = require('./nodemailer');


// подключение к бд
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'PRObatio',
  user: 'postgres',
  password: 'postgres',
});


// автоматическая генерация пароля
function gen_password(){
            var password = "";
            var length=Math.floor(Math.random()*(20-8+1))
            var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++){
                password += symbols.charAt(Math.floor(Math.random() * symbols.length));     
            }
            return password;
        }

//генерация токена
const generateAccessToken = (login, user_role) => {
    const payload = {       
        login,
        user_role
    }
    return jwt.sign(payload,'SECRET_KEY', {})
}

//проверка токена
 cookieJwtAuth = (req,res,next) => {
        const token = req.cookies.token
        try {
            const user = jwt.verify(token,'SECRET_KEY')
            req.user = user
            next()
        } catch(er) {
            res.clearCookie('token')
            return res.redirect('/')
        }   
    }

//страница входа(Главная)
router.route('/')
    .get(function(req, res) {
        res.sendFile(__dirname+'/html/general/index.html')
    })
        
    .post(async function(req, res){
        const {login,password} = req.body
        pool.query(`SELECT user_role, user_password FROM users where login='${login}'`,(q_err,q_res) => {
            if(q_err) console.log(q_err)
            else {
                const validPassword = bcrypt.compareSync(password,q_res.rows[0]['user_password']) //сравниваем пароли 
            if (validPassword) {
                // if (password==q_res.rows[0]['user_password']){
                const token = generateAccessToken(login, q_res.rows[0]['user_role']) //создаем токен

            res.cookie('token',token,{  //сохраняем его в cookie
                httpOnly: true
            })
                return res.redirect('/personal_account')
            }
            else{ return res.redirect('/')}
        }
            
    })}

    )

//восстановление доступа
router.route('/reset')
    .get(function(req, res) {
        res.sendFile(__dirname+'/html/general/reset_password.html')
    })

    .post(function(req, res) {
        const email=req.body
        password=gen_password()
        hash_password=bcrypt.hashSync(password, 6)

        pool.connect(function(error, client, done) {         
            let sql=`SELECT login from users WHERE email=${email}`
            let sql2 = `UPDATE users SET password=${hash_password} WHERE email=${email}`
            client.query(sql).then((response)=>{client.query(sql2, [], function(err, resp) {
                done();
                if (response.rows.length!=0){
                    reset(email, response.rows[0]['login'], password) 
                }
                res.redirect('/')
                })})      
    })
    })

//выход
router.route('/exit')
    .get(function(req, res){
        res.clearCookie('token') 
        return res.redirect('/')
    })

//маршрутизация по личным кабинетам в зависимости от роли    
router.route('/personal_account')
    .get(function (req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
            if (req.cookies.token){
                let role= payload.user_role
            if (role=='Администратор'){
                return res.redirect('/admin_account')
            }
            if (role=='Преподаватель'){
                return res.redirect('/teacher_account')
            }    
            if (role=='Студент'){
                return res.redirect('/student_account')
            }
    }})

//личный кабинет администратора
router.route('/admin_account')
    .get(cookieJwtAuth, function(req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        if (req.cookies.token){
            pool.connect(function(error, client, done) {
                // личная информация
                let sql = `SELECT * FROM users WHERE login='${payload.login}'`
                client.query(sql).then((response)=>{
                        done();
                    res.render('admin_account',{
                    layout: 'admin_account_layout',
                    user:response.rows[0]                  
                }); 
                    })})          
    }
    }) 

    //сохранение изменений
    .post(function(req, res){
        var {new_lastname, new_firstname,new_middlename, new_phone, new_email, new_password}=req.body
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        let fields=[]
        if (new_lastname){
            fields.push(`lastname = '${new_lastname}'`)
        }
        if (new_firstname){
            fields.push(`firstname = '${new_firstname}'`)
        }
        if (new_middlename){
            fields.push(`middlename = '${new_middlename}'`)
        }
        if (new_phone){
            fields.push(`phone = '${new_phone}'`)
        }
        if (new_email){
            fields.push(`email = '${new_email}'`)
        }
        if (new_password){
            fields.push(`password = '${bcrypt.hashSync(new_password, 6)}'`)
        }
        if (fields.length!=0) {
            let sql = `update users set ${fields.join(', ')} where login='${payload.login}'`
            pool.query(sql, (request, response) =>{
                res.redirect('/admin_account')})}
        else {
            res.redirect('/admin_account')
        }
        
    })

// добавление нового пользователя  
router.route('/creating')
    .get(function (req, res){
        pool.connect(function(error, client, done) {
            // список существующих студентов и преподавателей
            let sqlStr = `SELECT * FROM users where user_role='Преподаватель'`
            let sqlStr2 = `SELECT * FROM users where user_role='Студент'`
            client.query(sqlStr).then((response)=>{client.query(sqlStr2, [], function(err, resp) {
                    done();
                res.render('creating',{
                layout: 'create_new_user',
                list_of_students:resp.rows,
                list_of_teachers:response.rows
            }); 
                })})      
    })})
      
    .post(async function(req, res){
        // запись данных
        var {lastname,username,middlename,phone,email,role,group, list_of_students, list_of_teachers}=req.body
        
        // создание пароля
        password=gen_password()
        hash_password=bcrypt.hashSync(password, 6)
        
        // отправление новому пользователю учетных данных
        pool.connect(function(error, client, done) {
        let sql_login=`select '${lastname}' || ((SELECT count(*) from users where login LIKE '${lastname}%')+1) as login`
        client.query(sql_login).then((response)=>{
            done();
            send_info(email, response.rows[0]['login'], password); 
        }) })

        // запись пользователя в бд(Администратор)
        if (role=='Администратор'){
            pool.query(`INSERT INTO users(lastname,firstname,middlename,user_role,phone,email,login,user_password) 
            values ('${lastname}','${username}','${middlename}','${role}', '${phone}','${email}',
            (select '${lastname}' || ((SELECT count(*) from users where login LIKE '${lastname}%')+1) 
            as "Login"),'${hash_password}')`,(q_err,q_res) => {
            if(q_err) return (q_err)
            res.redirect('/creating')
        })}

        // запись пользователя в бд(Преподаватель)
        if (role=='Преподаватель'){

            // считывание списка прикрепленных студентов
            if (!list_of_students)
                {var students=[]
            } else
            {
                if (list_of_students.length<2)
                {var students=toArray(list_of_students)}
                else {var students=list_of_students}
            }

            // запись в бд
            pool.query(`INSERT INTO users(lastname,firstname,middlename,user_role,phone,email,login,user_password, list_of_students)
             values ('${lastname}','${username}','${middlename}','${role}', '${phone}','${email}',
             (select '${lastname}' || (SELECT count(*)+1 from users where login LIKE '${lastname}%') 
             as "Login"),'${hash_password}', '{${students}}')`,(q_err,q_res) => {
            if(q_err) return (q_err)

            // перенаправление на эту же страницу
            res.redirect('/creating')})}
       
        // запись пользователя в бд(Студент)
        if (role=='Студент'){               
            
            // считывание списка прикрепленных преподавателей
            // добавление к записи каждого преподавателя данного Студента
            if (list_of_teachers){
               for (let i=0;i<list_of_teachers.length;i++){
                let teacher=list_of_teachers[i]
                console.log(teacher)
                pool.query(`update users set list_of_students=
                array_append((select list_of_students from users where login='${teacher}'),
                (select '${lastname}' || (SELECT count(*) from users where login LIKE '${lastname}%')+1)::varchar(255))
                where login='${teacher}'`,(q_err,q_res) => {
                    if(q_err) return (q_err)
                })} 
            }   
            
            // запись в бд
            pool.query(`INSERT INTO users(lastname,firstname,middlename,user_role,phone,email,login,user_password,
                user_group) values ('${lastname}','${username}','${middlename}','${role}', '${phone}','${email}',
                (select '${lastname}' || ((SELECT count(*) from users where login LIKE '${lastname}%')+1) 
                as "Login"),'${hash_password}','${group}')`,(q_err,q_res) => {
                    if(q_err) return (q_err)
                    res.redirect('/creating')})}
                })
  
//личный кабинет преподавателя
router.route('/teacher_account')
    .get(cookieJwtAuth, function(req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        if (req.cookies.token){
            pool.connect(function(error, client, done) {
                let sql = `SELECT * FROM users WHERE login='${payload.login}'`
                let sql2=`select * from users where (select list_of_students from users where login='${payload.login}') && ARRAY[login];`
                let sql3=`select id, name, time, quantity_attempts from test where author='${payload.login}'`
                client.query(sql).then((response)=>{
                    client.query(sql2).then((resp)=>{
                        client.query(sql3, [], function(err, respon) {
                            done();
                        res.render('teacher_account',{
                        layout: 'teacher_account_layout',
                        user:response.rows[0],
                        student: resp.rows, 
                        tests: respon.rows               
                    }); 
                        })
                    })
                })     
                    })      
    }
    }) 

    //сохранение изменений
    .post(function(req, res){
        var {new_lastname, new_firstname,new_middlename, new_phone, new_email, new_password}=req.body
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        let fields=[]
        if (new_lastname){
            fields.push(`lastname = '${new_lastname}'`)
        }
        if (new_firstname){
            fields.push(`firstname = '${new_firstname}'`)
        }
        if (new_middlename){
            fields.push(`middlename = '${new_middlename}'`)
        }
        if (new_phone){
            fields.push(`phone = '${new_phone}'`)
        }
        if (new_email){
            fields.push(`email = '${new_email}'`)
        }
        if (new_password){
            fields.push(`password = '${bcrypt.hashSync(new_password, 6)}'`)
        }
        if (fields.length!=0) {
            let sql = `update users set ${fields.join(', ')} where login='${payload.login}'`
            pool.query(sql, (request, response) =>{
                res.redirect('/teacher_account')})}
        else {
            res.redirect('/teacher_account')
        }       
    })

//создание теста
router.route('/create_test')
    .get(cookieJwtAuth, function(req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        pool.connect(function(error, client, done) {
            // список прикрепленных студентов 
            let sqlStr = `SELECT UNNEST(list_of_students) as login FROM users where login='${payload.login}'`
            //список прикрепленных групп
            let sqlStr2 = `select user_group from users
            join (SELECT UNNEST(list_of_students) as login FROM users where login='${payload.login}') as list_st 
            on list_st.login=users.login
            group by users.user_group`
            client.query(sqlStr).then((response)=>{client.query(sqlStr2, [], function(err, resp) {
                    done();
                res.render('create_test',{
            layout: 'create_test_layout',
                list_of_students:response.rows,
                list_of_groups:resp.rows
            }); 
                })})      
    })
    })

    //запись теста в бд
    .post(function(req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        if (req.body) {
            const {test_name, hours, min, q_a, list_of_students, list_of_groups} =req.body
            const settings=['test_name', 'hours', 'min', 'q_a', 'list_of_students', 'list_of_groups']
            var time=0
            if (hours){time=parseInt(hours)*60}
            if (min){time+=parseInt(min)}
            q_answ=[]
            var list_keys=Object.keys(req.body)
            var c={}
            list_keys.forEach(function(key){ 
                if (!settings.includes(key)){
                 if (key.indexOf('ans')==-1){
                    var list_ans={}
                    list_keys.forEach(function(key_ans){ 
                        if (!settings.includes(key_ans)){
                            if (key_ans.indexOf(key+'ans')!=-1) {  
                                var l_a=req.body[key_ans]
                                if (typeof(l_a)=='string')
                                {list_ans[l_a]="off"}
                                else {list_ans[l_a[0]]=l_a[1]}
                        }}})
                    
                    c[req.body[key]]=list_ans                
                    }
                }})
            var n_q_a=0
            if (q_a){n_q_a= q_a}
            sql=`INSERT INTO test(name, author, quantity_attempts, access_for_group,
                access_for_students, time, questions_and_answer)
                Values ('${test_name}', '${payload.login}', ${n_q_a}, '{${list_of_groups}}', 
                '{${list_of_students}}', ${time}, '${JSON. stringify(c)}'::json)`
            pool.query(sql, (err, response) =>{
            if (err) {console.log(err)}
            res.redirect('/create_test')
        })    
        }    
    })

//тестирование
router.route('/testing/*')
    .get(function(req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        const id_test = decodeURI(req.url).replace('/testing/','')
        if (req.cookies.token){
            pool.connect(function(error, client, done) {
                let sql = `select questions_and_answer as "q" from test where id='${id_test}'`
                let sql2=`select name, time, quantity_attempts, author from test where id='${id_test}'`
                let sql3=`select count(*) from test_student where test_id='${id_test}' and student_id='${payload.login}'`
                client.query(sql).then((response)=>{
                    client.query(sql2).then((resp)=>{
                        client.query(sql3).then((respon)=>{
                        done();
                    var cas=response.rows[0]['q']
                    var attempt=`Попытка: ${parseInt(respon.rows[0]['count'])+1}.`
                    if (resp.rows[0]['quantity_attempts']!=0){
                        if (respon.rows[0]['count']==resp.rows[0]['quantity_attempts']) {
                            return res.redirect('/personal_account')
                        }
                        attempt=`Попытка: ${parseInt(respon.rows[0]['count'])+1}/${resp.rows[0]['quantity_attempts']}.`
                    }
                    let timer='not_timer'
                    if (resp.rows[0]['time']!=0){
                         timer='timer'}
                    res.render('testing',{
                    layout: 'testing_layout',
                    k:cas,
                    time:resp.rows[0]['time'],
                    test_name: resp.rows[0]['name'],
                    attempt: attempt,
                    author:resp.rows[0]['author'],
                    timer_name:timer,              
                    })   
                })           
                }); 
                    })})          
    }
    })

    .post(function(req, res) {
        const id_test = decodeURI(req.url).replace('/testing/','')
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        const ans=req.body
        var c_c=0
        var w_w=0
        for (var item in ans) {
            if (item=='on') {
                if (typeof(ans[item])!='string')
                {c_c=ans[item].length}
                else{c_c=1}
            }
            else{
                if (typeof(ans[item])!='string')
                {w_w=ans[item].length}
                else{w_w=1}
            }
        }
        
        pool.connect(function(error, client, done) {

            let sql = `select questions_and_answer as "q" from test where id='${id_test}'`    
            client.query(sql).then((response)=>{
                    
                let w=0
                let c=0    
                var cas=response.rows[0]['q']
                for (var item in cas) {
                    for (var i in cas[item]){      
                        if (cas[item][i]=="off"){w+=1}
                        else{c+=1}
                    }
                }
                const result=((c_c-(w_w*0.5))/c)*100
                
                if (payload.user_role=='Студент'){
                    let sql2 = `INSERT INTO test_student(test_id, student_id, marks, date_testing)
                    VALUES (${id_test}, '${payload.login}', ${result}, current_date)`
                    client.query(sql2).then((resp, err)=>{
                        if (err){console.log(err)}
                        done();})
                }            
                res.redirect('/result/'+result)
            })          

        })
    })

//результат прохождения теста
router.route('/result/*')
    .get(function(req, res) {
        const current_result = decodeURI(req.url).replace('/result/','') 
        res.render('result',{
        layout: 'result_layout',
        result:current_result                 
    }); 
    })

//успеваемость по тесту
router.route('/test_progress/*')
    .get(function(req, res) {
        const current_test = decodeURI(req.url).replace('/test_progress/','')
        if (req.cookies.token){
            pool.connect(function(error, client, done) {
                let sql=`select marks, date_testing::varchar, test.name, 
                        lastname, firstname, middlename, user_group, login
                        from test_student
                        join test on test.id=test_student.test_id
                        join users on test_student.student_id=users.login
                        where test_id=${current_test}`
                client.query(sql).then((response)=>{
                        done();
                    res.render('test_progress',{
                    layout: 'test_progress_layout',
                    student:response.rows,
                    name:current_test                  
                }); 
                    })})          
    }
    })

//личный кабинет студента
router.route('/student_account')
    .get(cookieJwtAuth, function(req, res) {
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        if (req.cookies.token){
            pool.connect(function(error, client, done) {
                //личная информация
                let sql = `SELECT * FROM users WHERE login='${payload.login}'`
                
                client.query(sql).then((response)=>{
                    //список тестов
                    let sql2=`select test.id, test.name, test.author, test.quantity_attempts from users 
                right join test on users.login=test.author
                where (test.access_for_students && ARRAY['${payload.login}'::varchar(255)]) or 
                    (test.access_for_group && ARRAY['${response.rows[0]['user_group']}'::varchar(255)] and 
                     users.list_of_students && ARRAY['${payload.login}'::varchar(255)])`
                    client.query(sql2, [], function(err, resp) {
                        done();
                    res.render('student_account',{
                    layout: 'student_account_layout',
                    user:response.rows[0],
                    tests: resp.rows                  
                }); 
                    })})      
                    })      
    }
    }) 

    //сохранение изменений
    .post(function(req, res){
        var {new_lastname, new_firstname,new_middlename, new_phone, new_email, new_password}=req.body
        const payload = jwt.verify(req.cookies.token,'SECRET_KEY')
        let fields=[]
        if (new_lastname){
            fields.push(`lastname = '${new_lastname}'`)
        }
        if (new_firstname){
            fields.push(`firstname = '${new_firstname}'`)
        }
        if (new_middlename){
            fields.push(`middlename = '${new_middlename}'`)
        }
        if (new_user_group){
            fields.push(`user_group = '${new_user_group}'`)
        }
        if (new_phone){
            fields.push(`phone = '${new_phone}'`)
        }
        if (new_email){
            fields.push(`email = '${new_email}'`)
        }
        if (new_password){
            fields.push(`password = '${bcrypt.hashSync(new_password, 6)}'`)
        }
        if (fields.length!=0) {
            let sql = `update users set ${fields.join(', ')} where login='${payload.login}'`
            pool.query(sql, (request, response) =>{
                res.redirect('/student_account')})}
        else {
            res.redirect('/student_account')
        }
        
    })

//успеваемость студента
router.route('/student_progress/*')
    .get(function(req, res) {
        const current_login = decodeURI(req.url).replace('/student_progress/','')
        if (req.cookies.token){
            pool.connect(function(error, client, done) {
                let sql = `SELECT * FROM users WHERE login='${current_login}'`
                client.query(sql).then((response)=>{
                    let sql2=`select test_id, marks, date_testing::varchar, test.name from test_student
                        join test on test.id=test_student.test_id where student_id='${current_login}'`
                        client.query(sql2).then((resp)=>{
                            done();
                            res.render('student_progress',{
                            layout: 'student_progress_layout',
                            user:response.rows[0],
                            test:resp.rows   
                            })               
                }); 
                    })})          
    }
    })
 
module.exports = router