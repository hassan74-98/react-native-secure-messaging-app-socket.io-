import { io } from "socket.io-client/dist/socket.io";

const URL = "http://192.168.11.110:7777";
// const URL = "http://116.203.137.207:7777";
const socket = io(URL, { 
    autoConnect: false,
    secure: true

});

socket.onAny((event, ...args) => {
    console.log("********************* TEST ********************")
    console.log("event : ",event)
    // console.log("args : ",args)
    console.log("*********************  END  ********************")
});

export default socket;