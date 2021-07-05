import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Button, Dimensions, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard';
import "../shim"
import crypto from "crypto"
import bip39 from "react-native-bip39"
import chatContext from '../contexts/chatContext'
import PushNotification, { Importance } from 'react-native-push-notification';

import Icon from 'react-native-vector-icons/Entypo'
const AlicePassphrase = "bracket soda cage release unfair spatial require oval warfare loan shrug subject"
const BobPassphrase = "six network this pistol biology ozone hurdle cotton vibrant dice mind approve"
const image = require('../assets/backgroundBlack.jpg') ;
const d = Dimensions.get("screen")


// import axios from 'axios';
 
// export const API = 'https://hn.algolia.com/api/v3';
 
// export const fetchData = async query => {
//   const url = `${API}/search?query=${query}`;
 
//   return await axios.get(url);
// };
 

export default function Login() {
    const {chatFunctions,chatState,socket} = useContext(chatContext)
    const scrollRef = useRef()
    const [isFocused, setisFocused] = useState(false)
    const [passPhrase, setpassPhrase] = useState("");
    const [isNewTriggered, setisNewTriggered] = useState(false)
    const [inputValue, setinputValue] = useState("")
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState("")
    useEffect(() => {
        // PushNotification.configure({
        //     // (optional) Called when Token is generated (iOS and Android)
        //     onRegister: function (token) {
        //       console.log("TOKEN:", token);
        //     },
          
        //     // (required) Called when a remote is received or opened, or local notification is opened
        //     onNotification: function (notification) {
        //       console.log("NOTIFICATION:", notification);
          
        //       // process the notification
        //     },          
        //     // IOS ONLY (optional): default: all - Permissions to register.
        //     permissions: {
        //       alert: true,
        //       badge: true,
        //       sound: true,
        //     },
        //     popInitialNotification: true,
        //     requestPermissions: true,
        //   });
    }, [])
    return (
        <ImageBackground source={image} style={styles.ImageBackground}>
            <ScrollView style={{width:"100%",flex:1}} ref={scrollRef} >
                <View style={{alignItems:"center",marginTop:100}} >
                    <Image source={require('../assets/composer.png')} style={styles.icon} />
                    {/* <Image source={require('../assets/GR.png')} style={styles.icon} /> */}
                    <Text style={{color:"#0276E8",fontSize:30}} >
                        SMSGR
                    </Text>
                </View>
                <TextInput
                    style={[styles.input,{color:(isFocused) ? "#428af8" : "white"} ]}
                    underlineColorAndroid={
                        isFocused ? "#428af8" : "white"
                    }
                    
                    placeholderTextColor= {(isFocused) ? "#428af8" : "white"}
                    onFocus={() => {setisFocused(true)}}
                    onBlur={()=>{setisFocused(false)}}
                    selectionColor={"#428af8"}
                    placeholder={(isFocused || inputValue.length > 0) ? "" : "Enter your passphrase to login"}
                    // label="pass phrase" 
                    value={inputValue}
                    onChangeText={setinputValue}
                    // secureTextEntry={true}
                />
                {(error.length > 0) && (
                    <View style={{width:"100%",justifyContent:"center",alignItems:"center"}}>
                        <Text style={{color:"red",margin:10}}>
                            {error}
                        </Text>
                    </View>
                )}
                
                
                <View style={{alignItems: 'center'}}>
                    <View style={{paddingBottom:20}}>
                        <TouchableOpacity 
                            style={{backgroundColor:"#428af8",borderRadius:2,flexDirection:"row",alignItems:"center",padding:5}}
                            onPress={()=>{
                                // PushNotification.localNotificationSchedule({
                                //     //... You can use all the options from localNotifications
                                //     message: "My Notification Message", // (required)
                                //     date: new Date(Date.now() + 1000), // in 60 secs
                                //     allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
                                  
                                //     /* Android Only Properties */
                                //     repeatTime: 1, // (optional) Increment of configured repeatType. Check 'Repeating Notifications' section for more info.
                                // });
                                // seterror("")
                                setloading(true)
                                chatFunctions.Login(inputValue,socket).then(()=>{
                                    // setloading(false)
                                }).catch((e)=>{
                                    setloading(false)
                                    seterror(e)
                                })
                            }}
                        >
                            {(loading) && (<ActivityIndicator animating={true} size={30} color="#fff" style={{}}/>) }
                            
                            <Text style={{color:"white",fontSize:15,padding:5}}>
                                LOGIN
                            </Text>
                        </TouchableOpacity>
                        
                    
                        
                    </View>
                    {/* <Text style={{color:"white"}}>
                        {JSON.stringify(test)}
                    </Text>
                    <View style={{paddingBottom:20}}>
                        <Button
                            title={"test"}
                            onPress={() => {
                                // console.log("Object.values(x.data)")
                                axios.get("http://116.203.137.207:7777").then((x)=>{
                                    console.log(Object.values("x.data"))
                                    // let l = []
                                    // x.data.map((i)=>{
                                    //     l.push("i.address")
                                    // })
                                    // settest(x)
                                    // console.log(l)
                                }).catch((e)=>{
                                    settest(e)
                                    // console.log("error : ",e)
                                })
                                // fetchData('react');
                                // chatFunctions.Login(inputValue)
                            }}
                            color={"#428af8"}
                        />   
                    </View> */}
                    <View style={{flexDirection:"row"}}>
                        <TouchableOpacity onPress={()=>{
                            
                        }}>
                            <Image source={require("../assets/scanQrCode.png")} style={styles.scanQrIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Image source={require("../assets/selectQrCode.png")} style={styles.selectQrIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{alignItems:"center",width:"100%",marginVertical:50}} >
                    <Text style={{color:"white"}} >
                        or connect by fingerprint.
                    </Text> 
                    <TouchableOpacity onPress={()=> {
                        // bip39.generateMnemonic().then((mnemonic)=>{
                        //     // console.log(mnemonic)
                        //     setisNewTriggered(true);
                        //     setpassPhrase(mnemonic)
                        //     scrollRef.current.scrollToEnd({
                        //         animated : true
                        //     })
                        // })
                        setloading(true)
                        chatFunctions.Persist(socket).then(()=>{
                            // setloading(false)
                        }).catch(()=>{
                            setloading(false)
                        })

                    }}
                        style={{margin:20,alignItems:"center"}}
                    >
                        <Icon name={"fingerprint"} size={40} color={"white"} />
                        {/* Entypo */}
                        
                        <Text style={{color:"white",textDecorationLine: 'underline',paddingVertical:5}} >
                            finger print
                        </Text>      
                    </TouchableOpacity>  
                    
                </View>
                {/* <View style={{alignItems:"center",width:"100%",marginVertical:50}} >
                    <Text style={{color:"white"}} >
                        or create a new anonymous address.
                    </Text> 
                    <TouchableOpacity onPress={()=> {
                        bip39.generateMnemonic().then((mnemonic)=>{
                            // console.log(mnemonic)
                            setisNewTriggered(true);
                            setpassPhrase(mnemonic)
                            scrollRef.current.scrollToEnd({
                                animated : true
                            })
                        })

                    }}>
                        <Text style={{color:"white",textDecorationLine: 'underline',paddingVertical:5}} >
                            Create new
                        </Text>      
                    </TouchableOpacity>  
                    
                </View> */}
                {(isNewTriggered) && (
                    <View style={{alignItems:"center",width:"100%",marginBottom:20}} >
                        <Text style={{color:"grey",paddingHorizontal:20}}>
                            <Text style={{fontWeight:"bold"}}>
                                {"Save "}
                            </Text> 
                            The passphrase for your new wallet and account. You must use the passphrase only. If you lose it, there will be no way to recover it
                        </Text>
                    </View>    
                )}
                {(isNewTriggered) && (
                    <View style={{flexDirection:"row",width:"100%",justifyContent:"center",alignItems:"center",height:80,marginBottom:100}}>
                        
                        <View style={{flexGrow:1,maxWidth:"50%"}}>
                            <Text style={{color:"grey"}}>
                                {passPhrase}
                            </Text>
                        </View>
                        <View style={{flexDirection:"row",paddingHorizontal:20}}>
                            <TouchableOpacity onPress={()=>{
                                setinputValue(AlicePassphrase)
                            }}>
                                <Image source={require("../assets/downloadTxt.png")} style={styles.passphraseIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                Clipboard.setString(passPhrase);
                            }}>
                                <Image source={require("../assets/downloadQrCodeImage.png")} style={styles.passphraseIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                setinputValue(BobPassphrase)
                            }}>
                                <Image source={require("../assets/copyPassPhrase.png")} style={styles.passphraseIcon} />
                            </TouchableOpacity>
                        </View>
                        

                    </View>    
                )}
            </ScrollView>
        </ImageBackground>
        // <View style={styles.container}>
        //     <StatusBar style="auto" />
        //     <ScrollView style={{width:'100%'}}>
        //         <Text style={{color:"black",fontSize:30,textAlign:'center',margin:20}}>
        //             Login
        //         </Text>
        //         <View style={{width:"100%",alignItems:"center"}}>
        //             <TextInput
        //                 value={passphrase}
        //                 onChangeText = {setpassphrase}
        //                 style={styles.input}
        //             />
        //             <View style={{flexDirection:"row",width:"100%",justifyContent:"space-around"}}>
        //                 <Button
        //                     title={"connect"}
        //                     onPress={()=>{
        //                         // console.log("passphrase : ",passphrase)
        //                         chatFunctions.Login(passphrase)
        //                     }}
        //                 /> 
        //                 <Button
        //                     title={"*"}
        //                     onPress={()=>{
        //                         setpassphrase("")
        //                         chatFunctions.Test()
        //                     }}
        //                 /> 
        //             </View>
                       
        //         </View>
        //         <View style={{width:"100%",textAlign:"center",alignItems:"center",marginVertical:20}}>
        //             <Text style={{fontSize:20}}>
        //                 Alice
        //             </Text>
        //             <TouchableOpacity onPress={()=>{setpassphrase(AlicePassphrase)}} style={{backgroundColor:"lightblue",padding:20}}>
        //                 <Text style={{textAlign:"center"}}>
        //                 bracket soda cage release unfair spatial require oval warfare loan shrug subject
        //                 </Text>
        //             </TouchableOpacity>
        //         </View>
        //         <View style={{width:"100%",textAlign:"center",alignItems:"center",marginVertical:20}}>
        //             <Text style={{fontSize:20}}>
        //                 Bob
        //             </Text>
        //             <TouchableOpacity onPress={()=>{setpassphrase(BobPassphrase)}} style={{backgroundColor:"pink",padding:20}}>
        //                 <Text style={{textAlign:"center"}}>
        //                 six network this pistol biology ozone hurdle cotton vibrant dice mind approve
        //                 </Text>
        //             </TouchableOpacity>
        //         </View>
        //     </ScrollView>
        // </View>
    )
}

const styles = StyleSheet.create({
    ImageBackground: {
        position: 'absolute',
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        width: d.width,
        height: d.height,
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    icon : {
        height:220,
        resizeMode:"contain"
    },
    input: {
        width: 300,
        height: 40,
        margin: 30,
        marginBottom:15,
        textAlign:"center",
        // textAlignVertical: 'top',
    },
    scanQrIcon : {
        width:35,
        height:35,
        marginHorizontal:5,
        borderRadius:20
    },
    selectQrIcon : {
        width:35,
        height:35,
        marginHorizontal:5
    },
    passphraseIcon : {
        marginHorizontal:3,
        width:25,
        height:25,
    },
    // container : {
    //     flex:1,
    //     alignItems:"center",
    //     justifyContent:"center"
    // },
    // input:{
    //     backgroundColor:"lightgrey",
    //     width:Dimensions.get("screen").width - 50,
    //     padding:20,
    //     borderRadius:20,
    //     margin:20
    // }
})
