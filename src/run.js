const jsonrpc = require('jsonrpc-lite')
const axios = require('axios')

const testService1 = 'http://52.3.224.220:8011/'
const testService2 = 'http://3.210.200.141:8011/'

const openRate = 750
const opRate = 200

// refactor, export as seperate module
const createBox = async (id, testService) => {
  // call create box, await for sync and ready
  const requestObj = jsonrpc.request(id, 'openBox')
  const res = await axios.post(testService, requestObj)
  if (res.data.result !== 'OK') throw new Error('Box Not Created')
  console.log('Box Open: ' + id)

  return {
    public: {
      set: async (key, val) => {
        const requestObj = jsonrpc.request(id, 'public.set', {key, val})
        const res = await axios.post(testService, requestObj)
        console.log('set: ' + id + " : " + res.data.result)
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
  let boxes = []
  const res = await Promise.all([createBoxes(3000, 3075, testService1), createBoxes(3075, 3150, testService2)])
  console.log('boxes open')
  boxes = boxes.concat(res[0], res[1])
  for (let i = 0; i < 1; i++) {
    await publicSetBoxes(i, i, boxes)
    console.log('set vals: ' + i)
  }
  console.log('set done')
})()
