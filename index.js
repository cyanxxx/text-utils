// ==UserScript==
// @name         Uppercase first letter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Cyanxxx
// @match        http://*/*
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
const excludeTagNames = [
  'script', 'style', 'xmp',
  'input', 'textarea', 'select',
  'pre', 'code',
  'h1', 'h2', 'h3', 'h4',
  'b', 'strong'
].map(a => a.toUpperCase());


let mode = 'blodCase'

function utils() {
  let nodeList = []
  let nodeMap = new WeakMap()
  let body = document.body;

  return {
    gather(body) {
      function map(node, arr) {
        if (!node) return
        if (node.childNodes.length > 0) {
          node.childNodes.forEach(c => {
            if (excludeTagNames.includes(node.tagName)) return;
            map(c, arr)
          });
          return
        }
        if (node.nodeType === 3) {
          arr.push(node)
        }
      }
      map(body, nodeList)
      return nodeList
    },
    modeDecorate(cb) {
      performance.mark(`${mode}-start`);
      const textEls = this.gather(body);
      textEls.forEach(cb)
      performance.mark(`${mode}-end`);
      performance.measure(
        mode,
        `${mode}-start`,
        `${mode}-end`
      );
      var measures = performance.getEntriesByName(mode);
      var measure = measures[0];
      console.log(`${mode} milliseconds:`, measure.duration)
    },
    upperCase() {
      this.modeDecorate(upperCase.bind(this, nodeMap))
    },
    blodCase() {
      this.modeDecorate(blodCase.bind(this, nodeMap))
    },
    reset() {
      this[`${mode}Rest`]()
    },
    blodCaseRest() {
      const nodeList = document.querySelectorAll(`.${mode}Text`)
      nodeList.forEach(el => {
        const cache = nodeMap.get(el)
        el.innerHTML = cache.text || ""
      })
    },
    upperCaseRest() {
      const nodeList = this.gather(body);
      nodeList.forEach(el => {
        const cache = nodeMap.get(el)
        if (!cache) return
        el.textContent = cache.text || ""
      })
    }
  }
}

function toggle(controller, e) {
  const target = e.currentTarget

  if (!target.getAttribute(mode)) {
    controller[mode]()
    target.setAttribute(mode, 'true')
    target.childNodes[0].textContent = 'cancel'
    target.childNodes[1].style.display = 'none'
  } else {
    controller.reset()
    target.setAttribute(mode, '')
    target.childNodes[0].textContent = `transform to ${mode}`
    target.childNodes[1].style.display = 'inline'
  }
}

const enCodeHTML = s => s.replace(/[\u00A0-\u9999<>\&]/g, w => '&#' + w.charCodeAt(0) + ';');
const engRegex = /[a-zA-Z][a-z]+/;
const engRegexg = /[a-zA-Z][a-z]+/g;

function blodCase(nodeMap, el) {
  if (nodeMap.has(el)) {
    return el.innerHTML = nodeMap.get(el).blodCase
  }
  const text = el.data;
  const spanEl = document.createElement('span');
  spanEl.className = `${mode}Text`;
  spanEl.innerHTML = enCodeHTML(text).replace(engRegexg, word => {
    let halfLength;
    if (/ing$/.test(word)) {
      halfLength = word.length - 3;
    } else if (word.length < 5) {
      halfLength = Math.floor(word.length / 2);
    } else {
      halfLength = Math.ceil(word.length / 2);
    }
    return '<strong>' + word.substr(0, halfLength) + '</strong>' + word.substr(halfLength)
  })
  el.after(spanEl);
  el.remove();
  nodeMap.set(spanEl, { text })
}

function upperCase(nodeMap, node) {
  if (nodeMap.has(node)) {
    return nodeMap.get(node).upperCaseText
  }
  const text = node.textContent
  const upperCaseText = text.replace(/\b([a-z])(\w*)/g, (match, p1, p2) => p1.toUpperCase() + p2)
  node.textContent = upperCaseText
  nodeMap.set(node, { text, upperCaseText })
}

function ui() {
  const container = document.createElement('div')
  const content = document.createElement('div')
  const span = document.createElement('span')
  const switchSpan = document.createElement('span')
  span.textContent = '<<'
  switchSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="0.8em" height="0.8em"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path fill="currentColor" d="M480 256c-17.67 0-32 14.31-32 32c0 52.94-43.06 96-96 96H192L192 344c0-9.469-5.578-18.06-14.23-21.94C169.1 318.3 159 319.8 151.9 326.2l-80 72C66.89 402.7 64 409.2 64 416s2.891 13.28 7.938 17.84l80 72C156.4 509.9 162.2 512 168 512c3.312 0 6.615-.6875 9.756-2.062C186.4 506.1 192 497.5 192 488L192 448h160c88.22 0 160-71.78 160-160C512 270.3 497.7 256 480 256zM160 128h159.1L320 168c0 9.469 5.578 18.06 14.23 21.94C337.4 191.3 340.7 192 343.1 192c5.812 0 11.57-2.125 16.07-6.156l80-72C445.1 109.3 448 102.8 448 95.1s-2.891-13.28-7.938-17.84l-80-72c-7.047-6.312-17.19-7.875-25.83-4.094C325.6 5.938 319.1 14.53 319.1 24L320 64H160C71.78 64 0 135.8 0 224c0 17.69 14.33 32 32 32s32-14.31 32-32C64 171.1 107.1 128 160 128z"/></svg>`
  const btn = document.createElement('div')
  const body = document.querySelector("body")
  span.style.cssText = `font-size: 0.5rem;`
  btn.textContent = `transform to ${mode}`
  btn.style.cssText = `
    display: none;
    padding: 5px 10px;
    color: var(--color);
    cursor: pointer;
    vertical-align: middle;
  `
  container.style.cssText = `
    font-size: 16px;
  `
  switchSpan.style.cssText = `
    width: 1em;
    height: 1em;
    margin-left: 3px;
  `
  content.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 2em;
    height: 2em;
    border-radius: 1em 0px 0px 1em;
    color: var(--color);
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index:9999;
  `
  document.querySelector(':root').style.cssText = `--color: #333;
    --background-color: #48D1CC;
    --color: #FFF;
    --border-color: #48D1CC;
    `
  const controller = utils(mode)
  btn.addEventListener('click', toggle.bind(btn, controller))
  content.appendChild(btn)
  content.appendChild(span)
  btn.appendChild(switchSpan)
  container.appendChild(content)
  switchSpan.addEventListener('click', (e) => {
    e.stopPropagation()
    if (switchSpan.getAttribute('data-mode') === 'upperCase') {
      mode = 'blodCase'
      switchSpan.setAttribute('data-mode', 'blodCase')
    } else {
      mode = 'upperCase'
      switchSpan.setAttribute('data-mode', 'upperCase')
    }
    btn.childNodes[0].textContent = `transform to ${mode}`
  })
  container.addEventListener('mouseover', () => {
    content.style.width = 'auto'
    content.style.justifyContent = 'flex-end'
    span.style.display = 'none'
    btn.style.display = 'inline-block'
  })
  container.addEventListener('mouseleave', () => {
    content.style.width = '2em'
    content.style.justifyContent = 'center'
    span.style.display = 'inline-block'
    btn.style.display = 'none'
  })
  body.appendChild(container)
}

ui()