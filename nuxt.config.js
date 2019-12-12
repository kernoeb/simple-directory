const config = require('config')
const URL = require('url').URL
const webpack = require('webpack')
const i18n = require('./i18n')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  srcDir: 'public/',
  build: {
    transpile: ['vuetify', /@koumoul/], // Necessary for "à la carte" import of vuetify components
    publicPath: config.publicUrl + '/_nuxt/',
    extend (config, { isServer, isDev, isClient }) {
      // Ignore all locale files of moment.js, those we want are loaded in plugins/moment.js
      config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
      config.plugins.push(new VuetifyLoaderPlugin())
    }
  },
  loading: { color: '#1e88e5' }, // Customize the progress bar color
  plugins: [
    { src: '~plugins/session', ssr: false },
    { src: '~plugins/query-params', ssr: false },
    { src: '~plugins/vuetify' },
    { src: '~plugins/moment' },
    { src: '~plugins/axios' },
    { src: '~plugins/analytics', ssr: false },
    { src: '~plugins/iframe-resizer', ssr: false }
  ],
  router: {
    base: new URL(config.publicUrl + '/').pathname
  },
  modules: ['@nuxtjs/markdownit', '@nuxtjs/axios', 'cookie-universal-nuxt', ['nuxt-i18n', {
    seo: false,
    locales: i18n.locales,
    defaultLocale: config.i18n.defaultLocale,
    vueI18n: {
      fallbackLocale: config.i18n.defaultLocale,
      messages: i18n.messages
    }
  }]],
  axios: {
    browserBaseURL: config.publicUrl + '/',
    baseURL: `http://localhost:${config.port}/`
  },
  env: {
    publicUrl: config.publicUrl,
    theme: config.theme,
    homePage: config.homePage,
    maildev: config.maildev.active ? config.maildev.url : null,
    defaultMaxCreatedOrgs: config.quotas.defaultMaxCreatedOrgs,
    readonly: require('./server/storages').readonly(),
    analytics: config.analytics,
    onlyCreateInvited: config.onlyCreateInvited,
    tosUrl: config.tosUrl,
    manageDepartments: config.manageDepartments
  },
  head: {
    title: i18n.messages[config.i18n.defaultLocale].root.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'application', name: 'application-name', content: i18n.messages[config.i18n.defaultLocale].root.title },
      { hid: 'description', name: 'description', content: i18n.messages[config.i18n.defaultLocale].root.description }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito:300,400,500,700,400italic' }
    ],
    style: []
  }
}

if (config.theme.cssUrl) {
  module.exports.head.link.push({ rel: 'stylesheet', href: config.theme.cssUrl })
}

if (config.theme.cssText) {
  module.exports.head.style.push({ type: 'text/css', cssText: config.theme.cssText })
}
