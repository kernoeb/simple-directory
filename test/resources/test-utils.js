const test = require('ava')
const axios = require('axios')
const fs = require('fs-extra')
const path = require('path')

const testDir = path.join(__dirname, '../')
const testFiles = fs.readdirSync(testDir).map(f => path.join(testDir, f))

exports.prepare = (testFile) => {
  const port = 5800 + testFiles.indexOf(testFile)
  const smtpPort = 1030 + testFiles.indexOf(testFile)
  process.env.NODE_ENV = 'test'
  process.env.PORT = port
  process.env.PUBLIC_URL = 'http://localhost:' + port
  process.env.MAILDEV_ACTIVE = true
  process.env.MAILDEV_SMTP = smtpPort
  process.env.MAILDEV_WEB = 1090 + testFiles.indexOf(testFile)
  process.env.MAILS_TRANSPORT = JSON.stringify({port: smtpPort, ignoreTLS: true})
  const config = require('config')

  let app
  test.before('run app', async t => {
    app = require('../../server/app.js')
    test.app = await app.run()
  })

  test.after('stop app', async t => {
    await app.stop()
  })

  return {test, config}
}

exports.axios = async (test, email) => {
  const config = require('config')
  const axOpts = {
    baseURL: config.publicUrl,
    validateStatus: status => status < 500
  }
  if (email) {
    await axios.post(config.publicUrl + '/api/v1/auth/passwordless', {email})
    // TODO get id_token
    const token = await new Promise((resolve, reject) => {
      test.app.get('maildev').on('new', email => {
        if (email.subject.indexOf('localhost:' + config.port) !== -1) {
          const match = email.text.match(/id_token=(.*)\s/)
          if (!match) return reject(new Error('Failed to extract id_token from mail content'))
          resolve(match[1])
        }
      })
    })
    axOpts.headers = {Authorization: 'Bearer ' + token}
  }
  return axios.create(axOpts)
}
