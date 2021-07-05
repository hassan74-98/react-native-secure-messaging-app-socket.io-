import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import socket from "../utils/socket";
import { makeUserFromPassphrase } from "../utils/wallet";
import AsyncStorage from "@react-native-async-storage/async-storage"
function createAction (type,payload) {
    return({
        type,
        payload
    })
}
const initReactiveProperties = (user) => {
    user.connected = true;
    user.messages = [];
    user.hasNewMessages = false;
};
export default function useChat(){
    let socketRef = useRef()
    let stateRef = useRef()
    useEffect(() => {
        socketRef.current = socket
    }, [])
    const chatFunctions = useMemo(() => ({
        Login : (passphrase) => {
            // console.log(passphrase)
            makeUserFromPassphrase(passphrase).then((user)=>{
                socketRef.current.auth = { 
                    username : user.userUid,
                }
                const s = socketRef.current
                socketRef.current.connect()
                socketRef.current.on("session", ({ sessionID, userID }) => {
                    console.log({ sessionID, userID })
                    socketRef.current.auth = { sessionID };
                    socketRef.current.userID = userID;
                    dispatch(createAction("SET_USER",{
                        username : {
                            ...user,
                            sessionID
                        }
                    }))    
                });
                socketRef.current.on("users", (users) => {
                    const Users = users.sort((a, b) => {
                        a.self = a.userID === s.id
                        if (a.self) return -1;
                        if (b.self) return 1;
                        if (a.username < b.username) return -1;
                        return a.username > b.username ? 1 : 0;
                    });
                    Users.map((x)=>{
                        initReactiveProperties(x)
                    })
                    dispatch(createAction("SET_AVAILABLE_USERS",Users))
                });
                socketRef.current.on("user connected", (user) => {
                    initReactiveProperties(user);
                    var Users = stateRef.current.AvailableUsers
                    Users.unshift(user)
                    dispatch(createAction("SET_AVAILABLE_USERS",Users))
                });
                socketRef.current.on("private message",({content,from})=>{
                    var Users = stateRef.current.AvailableUsers
                    for (let i = 0; i < Users.length; i++){
                        const user = Users[i];
                        if (user.userID === from) {
                            user.messages.push({
                              content,
                              fromSelf: false,
                            });
                            if(stateRef.current?.SelectedUser?.userID !== user.userID){
                                user.hasNewMessages = true;
                            }
                            break;
                        }
                    }
                    dispatch(createAction("SET_AVAILABLE_USERS",Users))
                })
            }).catch((e)=>{
                console.log("e : ",e)
            })
        },
        SelectUser : (user) => {
            return(new Promise((resolve,reject)=>{
                var Users = stateRef.current.AvailableUsers
                for (let i = 0; i < Users.length; i++){
                    const u = Users[i];
                    if (u.userID === user.userID) {
                        u.hasNewMessages = false;
                        dispatch(createAction("SELECT_USER",user))
                        resolve()
                        break;
                    }
                }
            }))
        },
        RemoveSelectUser : () => {
            dispatch(createAction("SELECT_USER",undefined))
        },
        LogOut : () => {
            socketRef.current.off("users")
            socketRef.current.off("user connected")
            socketRef.current.off("connection")
            dispatch(createAction("SET_USER",undefined))
        },
        SendMessage : ({content,to}) => {
            socketRef.current.emit("private message", {
                content,
                to
            });
            var Users = stateRef.current.AvailableUsers
            console.log(Users)
            for (let i = 0; i < Users.length; i++) {
                if (Users[i].userID === to) {
                    let lastMessage = {
                      content,
                      fromSelf: true,
                    }
                    Users[i].messages.push(lastMessage);
                  console.log(Users[i].messages)
                  break;
                }else{
                    console.log("no selected user")
                }
            }
            dispatch(createAction("SET_AVAILABLE_USERS",Users))
            
        },
        ListenForNewMessages : () => {

        },
        Test : () => {
            console.log(socketRef.current.auth)
            console.log(chatState)
        }
    }), [])
    const [chatState, dispatch] = useReducer((prevstate,action)=>{
        switch(action.type){
            // case 'SET_GLOBAL_SOCKET':
                
            //     return{
            //         ...prevstate,
            //         globalSocket : action.paylaod
            //     }
            case'SET_USER':
                stateRef.current = {
                    ...prevstate,
                    User : action.payload
                }
            // console.log("999999999999999 : ",action.payload)
                return stateRef.current
            case'SET_AVAILABLE_USERS':
                stateRef.current = {
                    ...prevstate,
                    AvailableUsers : action.payload
                }
                return stateRef.current
            case 'SELECT_USER':
                stateRef.current = {
                    ...prevstate,
                    SelectedUser:action.payload
                }
                return stateRef.current
                
        }
    }, {
        globalSocket : undefined,
        User : undefined,
        AvailableUsers : [],
        SelectedUser : undefined,
    })
    return({chatFunctions,chatState})
}