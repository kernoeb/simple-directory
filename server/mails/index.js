const mjml2html = require('mjml')
const util = require('util')
const path = require('path')
const fs = require('fs')
const config = require('config')
const nodemailer = require('nodemailer')
const flatten = require('flat')

const mjmlTemplate = fs.readFileSync(path.join(__dirname, 'mail.mjml'), 'utf8')

exports.init = async () => {
  const transport = nodemailer.createTransport(config.mails.transport)
  transport.sendMailAsync = util.promisify(transport.sendMail, {from: config.mails.from})
  return transport
}

// Custom micro templating to inject params into textual content with {param} syntax
const escapeRegExp = (str) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
function applyParams(txt, params) {
  Object.keys(params).forEach(p => {
    txt = txt.replace(new RegExp(escapeRegExp(`{${p}}`), 'g'), params[p])
  })
  return txt
}

exports.send = async ({transport, key, messages, to, params}) => {
  params = {
    ...params,
    ...flatten({brand: config.brand}),
    contact: config.mails.contact,
    logo: config.brand.logo || 'https://cdn.rawgit.com/koumoul-dev/simple-directory/627b6505/public/assets/logo-150x150.png'
  }
  Object.keys(messages.mails[key]).forEach(k => {
    params[k] = applyParams(messages.mails[key][k], params)
  })
  const mjmlRes = mjml2html(applyParams(mjmlTemplate, params))
  if (mjmlRes.errors && mjmlRes.errors.length) {
    console.error('Error while preparing mail body', mjmlRes.errors)
    throw new Error('Error while preparing mail body')
  }

  await transport.sendMailAsync({
    to,
    subject: applyParams(messages.mails[key].subject, params),
    text: applyParams(messages.mails[key].text, params),
    html: mjmlRes.html
  })
}