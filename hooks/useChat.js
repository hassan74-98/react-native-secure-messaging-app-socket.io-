import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { decodeMessageAsymetric } from "../utils/calculate";
import * as keychain from "react-native-keychain"
// import socket from "../utils/socket";
// import { io } from "socket.io-client/dist/socket.io";
import { makeUserFromPassphrase } from "../utils/wallet";
import BackgroudService from "../utils/backGroundTaskTest";
// const URL = "http://192.168.11.110:7777";
// const URL = "http://116.203.137.207:7777";
// import { makeUserFromPassphrase } from "../utils/wallet";
// import AsyncStorage from "@react-native-async-storage/async-storage"
function createAction (type,payload) {
    return({
        type,
        payload
    })
}
const sleep = (time) => {
    return(new Promise(resolve => setTimeout(() => resolve(), time)))
};
export default function useChat(){
    let socketRef = useRef()
    let stateRef = useRef()
    // const [socket, setSocket] = useState()

    // useEffect(() => {
    //     const newSocket = io(
    //       URL,
    //       { 
    //         autoConnect: false,
    //       }
    //     )
        
    //     chatFunctions.Persist(newSocket)
    //       newSocket.onAny((event, ...args) => {
    //         console.log("********************* TEST ********************")
    //         console.log("event : ",event)
    //         console.log("args : ",args)
    //         console.log("*********************  END  ********************")
    //     });
    //     // setSocket(newSocket)
    //     dispatchSocket(createAction("SET_SOCKET",newSocket))
    //     return () => newSocket.close()
    //     // }
        
    // }, [])
    useEffect(() => {
        stateRef.current = {}
        stateRef.current.AllUsers = {}
        sleep(1800).then(()=>{
            dispatch(createAction("SPLACHSCREEN"))
            console.log("test")
        })
        // (()=>{
        //     console.log("test")
        //     // return(new Promise(resolve => setTimeout(() => {
        //     //     console.log("timer ready")
        //     //     resolve()
        //     // }, 1000)))
        // })
        
        // BackgroudService.Stop()
        // socketRef.current = socket
    }, [])
    const chatFunctions = useMemo(() => ({
        connect : (socket,userUid,publicKey) => {

        },
        ListenforSession : (socket,user) => {
            socket.current.on("session", ({ sessionID ,ownData,conversations, allUsers }) => {
                // Store entire Session
                
                // ***********************
                let messagesByUid = {}
                Object.keys(conversations).map((id)=>{
                    messagesByUid[id.replace(user.userUid,"").replace("_","")] = JSON.parse(conversations[id])
                })
                var Users = {}
                Object.keys(allUsers).map((uid)=>{
                    if(uid !== user.userUid){
                        Users[uid] = {
                            hasNewMessages : false,
                            socketId : allUsers[uid]["socketId"],
                            publicKey : allUsers[uid]["publicKey"]
                        }
                        if(messagesByUid[uid]){
                            messagesByUid[uid]["messages"].map((message,i)=>{
                                if(message.senderUid === user.userUid){
                                    let decodedMessage = decodeMessageAsymetric(message.s,message.nonce, user["keyPair"]["publicKey"], user["keyPair"]["privateKey"] )
                                    messagesByUid[uid]["messages"][i]["text"] = decodedMessage
                                    messagesByUid[uid]["messages"][i]["forSelf"] = false
                                }else{
                                    let decodedMessage = decodeMessageAsymetric(message.r,message.nonce, allUsers[uid]["publicKey"], user["keyPair"]["privateKey"] )
                                    messagesByUid[uid]["messages"][i]["text"] = decodedMessage
                                    messagesByUid[uid]["messages"][i]["forSelf"] = true
                                }
                            })
                            Users[uid]["messages"] = messagesByUid[uid]["messages"]

                        }else{
                            Users[uid]["messages"] = []
                        }
                        if(allUsers[uid]["socketId"]){
                            Users[uid]["connected"] = true
                        }else{
                            Users[uid]["connected"] = false
                        }
                    }
                })
                stateRef.current.User = {
                    ...user,
                    sessionID,
                    ownData
                }
                stateRef.current.AllUsers = Users
                
                socket.current.auth = { sessionID };
                dispatch(createAction("SET_AllUsers",Users))
                
                dispatch(createAction("SET_USER",{
                    ...user,
                    sessionID,
                    ownData
                }))    
                dispatch(createAction("SPLACHSCREEN"))
                // AsyncStorage.setItem("session",JSON.stringify(user))
                // resolve()
            });
            socket.current.on("private message",({s,r,nonce,senderUid,receiverUid})=>{
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                let Users = stateRef.current.AllUsers
                // if()
                if(senderUid === stateRef.current.User.userUid){
                    let decodedMessage = decodeMessageAsymetric(s,nonce, user["keyPair"]["publicKey"], user["keyPair"]["privateKey"] )
                    Users[receiverUid]["messages"].push({
                        s,
                        r,
                        text : decodedMessage,
                        nonce,
                        senderUid,
                        forSelf : false,
                    })
                }else{
                    let decodedMessage = decodeMessageAsymetric(r,nonce, Users[senderUid]["publicKey"], user["keyPair"]["privateKey"] )
                    Users[senderUid]["messages"].push({
                        s,
                        r,
                        text : decodedMessage,
                        nonce,
                        senderUid,
                        forSelf:true,
                    })
                    if(stateRef.current.SelectedUser?.userUid !== senderUid){
                        Users[senderUid]["hasNewMessages"] = true
                    }
                    
                }
                dispatch(createAction("SET_AllUsers",Users))
                
            })
            socket.current.on("user connected", ({socketId,userUid,publicKey}) => {
                console.log("user connected : ",userUid)
                if(stateRef.current.SelectedUser?.userUid === userUid){
                    stateRef.current.SelectedUser.connected = true
                    stateRef.current.SelectedUser.socketId = socketId
                    
                    dispatch(createAction("SELECT_USER",stateRef.current.SelectedUser))
                    // Users[senderUid]["hasNewMessages"] = true
                }
                
                var Users = stateRef.current.AllUsers
                // console.log("previous users : ",Users)
                if(Users[userUid]){
                    Users[userUid]["socketId"] = socketId
                    Users[userUid]["connected"] = true    
                }else{
                    Users[userUid] = {
                        connected : true,
                        socketId,
                        hasNewMessages : false,
                        messages : [],
                        publicKey,
                    }
                }
                
                // initReactiveProperties(user);
                // var Users = stateRef.current.AvailableUsers
                // Users.unshift(user)
                dispatch(createAction("SET_AllUsers",Users))
            });
            socket.current.on("user disconnected",(userUid)=>{
                var Users = stateRef.current.AllUsers
                if(stateRef.current.SelectedUser?.userUid === userUid){
                    stateRef.current.SelectedUser.connected = false
                    dispatch(createAction("SELECT_USER",stateRef.current.SelectedUser))
                }
                if(Users[userUid]){
                    Users[userUid]["connected"] = false
                    Users[userUid]["socketId"] = undefined  
                    dispatch(createAction("SET_AllUsers",Users))  
                }
                
            })
        },
        ListenForNewUsers : (socket,user) => {
            socket.current.on("user connected", ({socketId,userUid,publicKey}) => {
                console.log("user connected : ",userUid)
                if(stateRef.current.SelectedUser?.userUid === userUid){
                    stateRef.current.SelectedUser.connected = true
                    dispatch(createAction("SELECT_USER",stateRef.current.SelectedUser))
                    // Users[senderUid]["hasNewMessages"] = true
                }
                
                var Users = stateRef.current.AllUsers
                // console.log("previous users : ",Users)
                if(Users[userUid]){
                    Users[userUid]["socketId"] = socketId
                    Users[userUid]["connected"] = true    
                }else{
                    Users[userUid] = {
                        connected : true,
                        socketId,
                        hasNewMessages : false,
                        messages : [],
                        publicKey,
                    }
                }
                
                // initReactiveProperties(user);
                // var Users = stateRef.current.AvailableUsers
                // Users.unshift(user)
                dispatch(createAction("SET_AllUsers",Users))
            });
        },
        ListenForNewMessages : (socket,user) => {
            socket.current.on("private message",({s,r,nonce,senderUid,receiverUid})=>{
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                let Users = stateRef.current.AllUsers
                // if()
                if(senderUid === stateRef.current.User.userUid){
                    let decodedMessage = decodeMessageAsymetric(s,nonce, user["keyPair"]["publicKey"], user["keyPair"]["privateKey"] )
                    Users[receiverUid]["messages"].push({
                        s,
                        r,
                        text : decodedMessage,
                        nonce,
                        senderUid,
                        forSelf : false,
                    })

                }else{
                    let decodedMessage = decodeMessageAsymetric(r,nonce, Users[senderUid]["publicKey"], user["keyPair"]["privateKey"] )
                    Users[senderUid]["messages"].push({
                        s,
                        r,
                        text : decodedMessage,
                        nonce,
                        senderUid,
                        forSelf:true,
                    })
                    if(stateRef.current.SelectedUser?.userUid !== senderUid){
                        Users[senderUid]["hasNewMessages"] = true
                    }
                    
                }
                dispatch(createAction("SET_AllUsers",Users))
                
            })
        },
        Persist : (socket) => {
            let start = (new Date()).getTime()
            return(new Promise((resolve,reject)=>{
                keychain.getGenericPassword().then((userCredentials)=>{
                    resolve()
                    // console.log(userCredentials.password)
                    if(userCredentials.password){
                        chatFunctions.Login(userCredentials.password,socket)
                    }else{
                        dispatch(createAction("SPLACHSCREEN"))
                    }
                })    
            }))
            
            // AsyncStorage.getItem("session").then((passphrase)=>{
            //     if(passphrase){
            //         chatFunctions.Login(passphrase,socket)
            //     }else{
            //         dispatch(createAction("SPLACHSCREEN"))
            //     }
            // })
            // AsyncStorage.getItem("session").then((sessionStr)=>{
            //     if(sessionStr){
            //         let session = JSON.parse(sessionStr)

            //         Object.keys(session["Users"]).map((uid)=>{
            //             console.log(session["Users"][uid]["publicKey"])
            //             session["Users"][uid]["messages"].map((message,i)=>{
            //                 if(message.senderUid === session.user.userUid){
                                
            //                     let decodedMessage = decodeMessageAsymetric(message.s,message.nonce, session.user.keyPair.publicKey, session.user.keyPair.privateKey )
            //                     // console.log("!!!!!!",decodedMessage)
            //                     session["Users"][uid]["messages"][i]["text"] = decodedMessage
            //                     session["Users"][uid]["messages"][i]["forSelf"] = true
            //                 }else{
            //                     let decodedMessage = decodeMessageAsymetric(message.r,message.nonce, session["Users"][uid]["publicKey"], session.user.keyPair.privateKey )
            //                     session["Users"][uid]["messages"][i]["text"] = decodedMessage
            //                     session["Users"][uid]["messages"][i]["forSelf"] = false
            //                 }        
            //             })
            //         })
            //         socket.auth = { 
            //             userUid : session.user.userUid,
            //             publicKey : session.user.keyPair.publicKey
            //         }
            //         socket.connect()
            //         chatFunctions.ListenforSession(socket,session.user).then(()=>{
            //             let finish = (new Date()).getTime()
            //             console.log((finish-start)/1000)
            //         })
            //         chatFunctions.ListenForNewUsers(socket,session.user)
            //         chatFunctions.ListenForNewMessages(socket,session.user)
            //         chatFunctions.ListenForDisconnectUsers(socket)
            //         dispatch(createAction("SET_AllUsers",session.Users))
            //         dispatch(createAction("SET_USER",session.user))     
            //     }
                
            // })
        },
        ListenForDisconnectUsers : (socket) => {
            socket.current.on("user disconnected",(userUid)=>{
                var Users = stateRef.current.AllUsers
                if(stateRef.current.SelectedUser?.userUid === userUid){
                    stateRef.current.SelectedUser.connected = false
                    dispatch(createAction("SELECT_USER",stateRef.current.SelectedUser))
                }
                if(Users[userUid]){
                    Users[userUid]["connected"] = false
                    Users[userUid]["socketId"] = undefined  
                    dispatch(createAction("SET_AllUsers",Users))  
                }
                
            })
        },
        Login : (passphrase,socket) => {
            let start = (new Date()).getTime()
            return(new Promise((resolve,reject)=>{
                makeUserFromPassphrase(passphrase).then((user)=>{
                    // console.log(user.userUid)
                    // AsyncStorage.setItem("session",passphrase)
                    keychain.setGenericPassword("key",passphrase,{
                        accesControl : keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                        securityLevel :  keychain.SECURITY_LEVEL.SECURE_HARDWARE,
                        storage :  keychain.STORAGE_TYPE.RSA,
                        // KeystoreRSAECB
                        // storage :  null,
                        accessible : keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY
                    })
                    console.log(user.keyPair)
                    socket.current.auth = { 
                        userUid : user.userUid,
                        publicKey : user.keyPair.publicKey.toString("hex")
                    }
                    socket.current.connect()
                    socket.current.on('connect_failed', function(){
                        socket.current.disconnect()
                        console.log('Connection Failed');
                        reject('Connection Failed')
                    });
                    socket.current.on("connect_error", (err) => {
                        socket.current.disconnect()
                        console.log(`connect_error due to ${err.message}`);
                        reject('Connection Failed')
                    });
                    chatFunctions.ListenforSession(socket,user)
                    // chatFunctions.ListenForNewUsers(socket,user)
                    // chatFunctions.ListenForNewMessages(socket,user)
                    // chatFunctions.ListenForDisconnectUsers(socket)
                    
                }).catch((e)=>{
                    console.log("error",e)
                    reject("invalid input")
                })
            }))
        },
        SelectUser : (userUid) => {
            return(new Promise((resolve,reject)=>{
                
                if(userUid === undefined){
                    dispatch(createAction("SELECT_USER",undefined))
                    stateRef.current.SelectedUser = undefined
                }else{
                    console.log('ping')
                    var Users = stateRef.current.AllUsers
                    // console.log("suspesious step : ",stateRef.current.AllUsers)
                    // console.log(Users[userUid])
                    Users[userUid]["hasNewMessages"] = false
                    var u = {
                        userUid,
                        ...Users[userUid]
                    }
                    // console.log(stateRef.current.SelectedUser)
                    stateRef.current.SelectedUser = u
                    dispatch(createAction("SELECT_USER",u))
                    resolve()
                }
            }))
        },
        RemoveSelectedUser : () => {
            dispatch(createAction("SELECT_USER",undefined))
        },
        LogOut : (socket) => {
            keychain.resetGenericPassword()
            console.log('LogOut')
            // socketRef.current.off("users")
            // socketRef.current.off("user connected")
            socket.current.disconnect()
            dispatch(createAction("DICONNECT"))
            AsyncStorage.clear()
            // socketRef.current.off("connection")
            // dispatch(createAction("SET_USER",undefined))
        },
        SendMessage : ({socket,s,r,nonce,to,socketId}) => {
            return(new Promise((resolve,reject)=>{
                // console.log(to)
                socket.current.emit("private message", {
                    s,
                    r,
                    nonce,
                    to,
                    socketId
                });
                resolve()   
            }))
            
            
            
        },
    }), [])
    const [chatState, dispatch] = useReducer((prevstate,action)=>{
        switch(action.type){
            case 'SPLACHSCREEN':
                return {
                    ...prevstate,
                    splashScreenOn : false
                }
            case'SET_USER':
                stateRef.current = {
                    ...prevstate,
                    User : action.payload
                }
                return stateRef.current
            case'SET_AllUsers':
                stateRef.current = {
                    ...prevstate,
                    AllUsers : action.payload
                }
                return stateRef.current
            case 'DICONNECT':
                return{
                    User : undefined,
                    SelectedUser : undefined,
                    AllUsers : {},
                    splashScreenOn : false
                }
            case 'SELECT_USER':
                stateRef.current = {
                    ...prevstate,
                    SelectedUser:action.payload
                }
                return stateRef.current
                
        }
    }, {
        splashScreenOn : true,
        globalSocket : undefined,
        User : undefined,
        AvailableUsers : [],
        SelectedUser : undefined,
        AllUsers : {}
    })
    // const [socket, dispatchSocket] = useReducer((prevstate,action)=>{
    //     switch(action.type){
    //         case 'SET_SOCKET':
    //             return action.payload
    //     }
    // }, null)
    return({chatFunctions,chatState})
}