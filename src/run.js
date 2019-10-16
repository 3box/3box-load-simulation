const jsonrpc = require('jsonrpc-lite')
const axios = require('axios')

const testService1 = 'http://18.213.113.225:8011/'
const openRate = 500
const opRate = 200

// refactor, export as seperate module
const createBox = async (id, testService) => {
  // call create box, await for sync and ready
  const requestObj = jsonrpc.request(id, 'openBox')
  const res = await axios.post(testService, requestObj)
  if (res.data.result !== 'OK') throw new Error('Box Not Created')

  return {
    public: {
      set: async (key, val) => {
        const requestObj = jsonrpc.request(id, 'public.set', {key, val})
        const res = await axios.post(testService, requestObj)
        return res.data.result
      },
      get: async (key) => {
        const requestObj = jsonrpc.request(id, 'public.get', {key})
        const res = await axios.post(testService, requestObj)
        return res.data.result
      }
    }
  }
}

// refactor, export as test utitility functions
// Returns a promise that resolves, once all boxes open
const createBoxes = async (from, to, testService) => {
  const boxPromises = []
  for (let i = from; i < to; i++) {
    boxPromises.push(createBox(i, testService))
    await new Promise(resolve => setTimeout(resolve, openRate))
  }
  return Promise.all(boxPromises)
}

// Returns a promise that resolves once all set resolve, also don't need to wait for resolve
const publicSetBoxes = async (key, val, boxes) => {
  const setPromises = []
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i]
    setPromises.push(box.public.set(key, val))
    await new Promise(resolve => setTimeout(resolve, opRate))
  }
  return Promise.all(setPromises)
}

(async () => {
  // Create boxes
  const boxes = await createBoxes(2000, 2100, testService1)
  console.log('done')
})()
