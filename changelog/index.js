import * as showdown from 'showdown'
import changeLog from '../CHANGELOG.md'
import './changelog.scss'

const converter = new showdown.Converter()
document.getElementById('markdown').innerHTML = converter.makeHtml(changeLog)
