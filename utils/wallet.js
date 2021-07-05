import '../shim.js'
import crypto from 'crypto'
import bip39 from 'react-native-bip39'
import { getHashFromPassphrase,getUserIdFromPublicKey,makeKeyPairFromHash } from './calculate'
const makeUserFromPassphrase = (passphrase) => {
    return(new Promise((resolve,reject)=>{
        const isMnemonic = bip39.validateMnemonic(passphrase)
        if(isMnemonic){
            const passphraseHash = getHashFromPassphrase(passphrase)
            const keyPair = makeKeyPairFromHash(passphraseHash)
            const userUid = getUserIdFromPublicKey(keyPair.publicKey)
            // keyPair.publicKey = keyPair.publicKey.toString("hex")
            // keyPair.privateKey = keyPair.privateKey.toString("hex")
            resolve({
                userUid,
                keyPair,
            })
        }else{
            reject()
        }
    }))
    
}
export {makeUserFromPassphrase}