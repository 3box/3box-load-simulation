const puppeteer = require('puppeteer');
const express = require('express')
const serveStatic = require('serve-static')
const path = require('path')
const jsonrpc = require('jsonrpc-lite')
const port = 8011


const startExpress = (page) => {
   const app = express()
   app.use(express.json())
   app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      next()
    })
   app.post('/', handler(page))
   app.listen(port, () => {
    console.log('rpc service running ')
   })
}

const handler = (page) => async (req, res, next) => {
  const payload = jsonrpc.parseObject(req.body).payload
  console.log(payload)
  const box = getBox(payload.id, page)
  let response
  switch(payload.method) {
    case 'openBox':
      await box.openBox()
      response = jsonrpc.success(payload.id, 'OK')
      console.log(`${payload.id}: openBox`)
      break;
    case 'public.set':
      await box.public.set(payload.params.key, payload.params.val)
      response = jsonrpc.success(payload.id, 'OK')
      console.log(`${payload.id}: public.set ${payload.params.key}:${payload.params.val}`)
      break;
    case 'public.get':
      const val = await box.public.get(payload.params.key)
      response = jsonrpc.success(payload.id, val)
      console.log(`${payload.id}: public.get ${payload.params.key}`)
      break;
    default:
      // code block
  }


   res.json(response)
}

const getBox = (id, page) => {
  const box = {}
  box.openBox = async () => {
    const res = await page.evaluate(async (id) => {
      await window.addBox(id)
      return true
    }, id)
    return res
  }
  box.public = {}
  box.public.set = async (key, value) => {
    const res = await page.evaluate(async (id, key, value) => {
      const box = window.boxes[id]
      const res = await box.public.set(key, value)
      return res
    }, id, key, value)
    return res
  }
  box.public.get = async (key) => {
    const res = await page.evaluate(async (id, key) => {
      const box = window.boxes[id]
      const res = await box.public.get(key)
      return res
    }, id, key)
    return res
  }
  return box
}

const startPuppeteer = async () => {
  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3022', {waitUntil: 'networkidle2'});
  return page
}

(async () => {
  const page = await startPuppeteer()
  await startExpress(page)
})()
