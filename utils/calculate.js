import '../shim'
import crypto from 'crypto'
import bip39 from 'react-native-bip39'
import sodium from 'sodium-browserify-tweetnacl'
import bignum from './bignumber.js'
import ed2curve from 'ed2curve'
import nacl from 'tweetnacl/nacl-fast'
import { decode } from '@stablelib/utf8'
import { bytesToHex, hexToBytes } from './hex'
const getHashFromPassphrase = (passphrase) => {
    const seedHex = bip39.mnemonicToSeed(passphrase).toString('hex')
    return(crypto.createHash('sha256').update(seedHex , "hex").digest())
}
const makeKeyPairFromHash = (hash) => {
    var keyPair = sodium.crypto_sign_seed_keypair(hash)
    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.secretKey
    }
}
const getUserIdFromPublicKey = (publicKey) => {
    const publicKeyHash = crypto.createHash('sha256').update(publicKey, 'hex').digest()
    const temp = Buffer.alloc(8)
    for (var i = 0; i < 8; i++) {
        temp[i] = publicKeyHash[7 - i]
    }
    return 'U' + bignum.fromBuffer(temp).toString()
}
const encodeMessageAsymetric = (msg,sender,receiverPublicKey) => {

    // , recipientPublicKey, privateKey
    const nonce = Buffer.allocUnsafe(24)
    sodium.randombytes(nonce)

    // if (typeof receiver.publicKey === 'string') {
    //   recipientPublicKey = hexToBytes(recipientPublicKey)
    // }
    const plainText = Buffer.from(msg)
    const rDHPublicKey = ed2curve.convertPublicKey(receiverPublicKey)
    const sDHPublicKey = ed2curve.convertPublicKey(sender.publicKey)

    const sDHSecretKey = ed2curve.convertSecretKey(sender.privateKey)
    
    const sEncrypted = nacl.box(plainText, nonce, sDHPublicKey, sDHSecretKey)
    const rEncrypted = nacl.box(plainText, nonce, rDHPublicKey, sDHSecretKey)
    // const r = nacl.box(plainText, nonce, DHPublicKey, DHSecretKey)
    // const s = nacl.box(plainText, nonce, DHPublicKey, DHSecretKey)
    const result = {
        s:bytesToHex(sEncrypted),
        r:bytesToHex(rEncrypted),
        nonce: bytesToHex(nonce)
    }
    return(result)
}
const decodeMessageAsymetric = (msg,nonce, senderPublicKey, privateKey ) => {
    if (typeof msg === 'string') {
      msg = hexToBytes(msg)
    }
  
    if (typeof nonce === 'string') {
      nonce = hexToBytes(nonce)
    }
  
    if (typeof senderPublicKey === 'string') {
      senderPublicKey = hexToBytes(senderPublicKey)
    }
  
    if (typeof privateKey === 'string') {
      privateKey = hexToBytes(privateKey)
    }
  
    const DHPublicKey = ed2curve.convertPublicKey(senderPublicKey)
    const DHSecretKey = ed2curve.convertSecretKey(privateKey)
    const decrypted = nacl.box.open(msg, nonce, DHPublicKey, DHSecretKey)
  
    return decrypted ? decode(decrypted) : ''
}
export {getHashFromPassphrase,makeKeyPairFromHash,getUserIdFromPublicKey,encodeMessageAsymetric,decodeMessageAsymetric}