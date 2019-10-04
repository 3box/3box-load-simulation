var PrivateKeyProvider = require("truffle-privatekey-provider");
const Box = window.Box
const EthCrypto = require('eth-crypto');

const pinningNode = '/dnsaddr/ipfs-dev.3box.io/tcp/443/wss/ipfs/QmTsx2ZFZksXQw3fyLvsEkKaGNarFPD6iADAvuthQhy3MZ'
window.boxes = {}
// Check if necessary, and if failure because of this, maybe switch provider things, or do signing like wrapper
const ganacheHost = "http://localhost:8545"
const keyLen = 64
const openRate = 1000 // 1 sec

const ethProvider = privateKey => {
  const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey)
  return {
    send: (data, callback) => {
      if (data.method === 'personal_sign') {
        let messageHash = EthCrypto.hash.keccak256(data.params[0]);
        let signature = EthCrypto.sign(privateKey, messageHash)
        callback(null, {result: signature})
      } else {
        callback(null, '0x')
      }
    },
    address: EthCrypto.publicKey.toAddress(publicKey)
  }
}


const createKeyProvider = (id) => {
  const privKey  = `${id}a${'1'.repeat(keyLen - id.toString().length - 1)}`
  const provider = new PrivateKeyProvider(privKey, ganacheHost)
  provider.id = id
  return provider
}

// Creates a box given a provider
const createBox = async (provider) =>  {
  const box =  await window.Box.openBox(provider.address,  provider, { pinningNode})
  box.onSyncDone(() => {
    console.log('onSyncDone Called for box ' + provider.id)
  })
  return box
}

// Creates 1 to num boxes and adds them to window.boxes
const addBox = async (id) => {
  const box = await createBox(createKeyProvider(id))
  window.boxes[id] = box
}

window.addBox = addBox
