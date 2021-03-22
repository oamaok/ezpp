require('./changelog.scss')
const showdown = require('showdown')

const converter = new showdown.Converter()
const element = document.getElementById('markdown')
element.innerHTML = converter.makeHtml(element.innerHTML)
element.style.display = 'block'
