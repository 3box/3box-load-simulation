const jsonrpc = require('jsonrpc-lite')
const axios = require('axios')

const testService1 = 'http://localhost:8011'
const openRate = 500
const opRate = 200

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

const createBoxes = async (from, to, testService) => {
  const boxes = []
  for (let i = from; i < to; i++) {
    await new Promise(resolve => setTimeout(resolve, openRate))
    console.log('createBox ' + i)
    const box = await createBox(i, testService)
    boxes.push(box)
  }
  return boxes
}

const publicSetBoxes = async (key, val, boxes) => {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i]
    box.public.set(key, val) // don't await response
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  return
}

(async () => {
  // Create boxes
  // const boxes = await createBoxes(1, 25, testService1)
  // await new Promise(resolve => setTimeout(resolve, 5000))
  // await publicSetBoxes('1', '1', boxes)
  // console.log('done')
  // const box = await createBox(1, testService1)
  // await box.public.set('f', 'g')
  // const val = await box.public.get('f')
  // console.log(val)
  //
  // const box2 = await createBox(2, testService1)
  // await box2.public.set('f', 'g')
  // const val2 = await box2.public.get('f')
  // console.log(val2)

  for (let i = 0; i < 25; i++) {
    console.log(i)
    const box = await createBox(i, testService1)
      console.log(i)
    await box.public.set('1', '1')
    const val = await box.public.get('1')
  }

  // console.log(box)
})()
