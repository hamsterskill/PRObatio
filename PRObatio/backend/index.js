const express = require('express');
const exphbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const routes = require('./route')
const exp = express();
const host = '127.0.0.1';
const port = process.env.PORT || 7000;
exp.use(express.static(__dirname))
exp.use(express.json())
exp.use(cookieParser())
exp.use(express.urlencoded({ extended: true }))

// шаблонизатор
const hbs = exphbs.create({
  defaultLayout:'create_new_user',
  extname:'hbs' 
})
 
exp.engine('hbs',hbs.engine) 
exp.set('view engine', 'hbs')
exp.set('views', 'views')
exp.use(routes)

const start = async () => {
  try {
    //запуск сервера
    exp.listen(port, host , () => console.log(`Server listens http://${host}:${port}`))
  }catch(er) {
    console.log(er)
  }
}

start()