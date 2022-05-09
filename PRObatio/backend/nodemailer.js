const nodemailer = require('nodemailer')
const Mail = require('nodemailer/lib/mailer')

function create_transport() {
  return nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'kavkaeva.tatyana@mail.ru',
      pass: 'p1C8bjRuAY50kqpeA7Zr',
    },
  })
}

function send_info(email, login, password) {
  create_transport().sendMail({
    from: '"PRObatio" <kavkaeva.tatyana@mail.ru>',
    to: email,
    subject: 'Добро пожаловать в PRObatio!',
    text: `Для начала работы с системой тестирования PRObatio используйте слудующие данные:
          Логин: ${login}, Пароль: ${password}.`,
    html:
    `Для начала работы с системой тестирования PRObatio используйте следующие данные:
    <p><p>Логин: ${login}, <p>Пароль: ${password}.`,
  })}


function reset(email, login, password) {
  create_transport().sendMail({
    from: '"PRObatio" <kavkaeva.tatyana@mail.ru>',
    to: email,
    subject: 'Восстановление доступа к аккаунту PRObatio',
    text: `Для восстановления доступа к системе тестирования PRObatio используйте следующие данные:
          Логин: ${login}, Пароль: ${password}.`,
    html:
    `Для восстановления доступа к системе тестирования PRObatio используйте слудующие данные:
    <p><p>Логин: ${login}, <p>Пароль: ${password}.`,
  })}


module.exports = {send_info, reset}