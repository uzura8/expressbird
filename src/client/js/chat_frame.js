import 'es6-promise/auto'
import config from '@/config/config'
import site from '@/util/site'
import str from '@/util/str'

const chatContainerId = config.chatContainerId
const origin = site.baseUri('origin')

const chatFlameStyles = {
  inActive: str.convObjToStr({
    border: 'none',
    display: 'block',
    width: '65px !important',
    height: '55px !important',
    position: 'fixed',
    top: 'auto',
    left: 'auto',
    right: '24px',
    bottom: '24px',
    visibility: 'visible',
    'z-index': 10001,
    'max-width': '100vh',
    'max-height': '100vw',
    background: 'transparent none repeat scroll 0% 0%',
    opacity: 1,
  }, ';'),
  active: str.convObjToStr({
    border: 'medium none',
    display: 'block',
    width: '400px !important',
    height: '85% !important',
    position: 'fixed',
    top: 'auto',
    left: 'auto',
    right: 0,
    bottom: 0,
    visibility: 'visible',
    'z-index': 10001,
    'max-width': '100vh',
    'max-height': '100vw',
    background: 'transparent none repeat scroll 0% 0%',
    opacity: 1,
  }, ';'),
}
const chatFrame = document.createElement('iframe')
chatFrame.setAttribute('id', 'ebChatFrame')
chatFrame.setAttribute('src', site.uri('include.html'))
chatFrame.setAttribute('title', 'EB Chat')
chatFrame.setAttribute('style', chatFlameStyles.inActive)

const gcInclude = () => {
  const elms = document.getElementsByTagName('body')
  if (elms.length == 1) {
    const chatContainer = document.createElement('div')
    chatContainer.setAttribute('id', chatContainerId)
    const containerStyleObj = {
      position: 'absolute',
      'z-index': 90000,
    }
    chatContainer.setAttribute('style', str.convObjToStr(containerStyleObj, ';'))
    chatContainer.appendChild(chatFrame)

    elms[0].appendChild(chatContainer)
  }
}

if (document.readyState !== 'loading') {
  gcInclude()
} else {
  document.addEventListener('DOMContentLoaded', gcInclude, false);
}

window.addEventListener('message', (e) => {
  if (e.origin == origin) {
    let chatActivityKey = e.data.chatActive === true ? 'active' : 'inActive'
    chatFrame.setAttribute('style', chatFlameStyles[chatActivityKey])
  }
}, false);
