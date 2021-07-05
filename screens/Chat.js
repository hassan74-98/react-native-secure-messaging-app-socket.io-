import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import chatContext from '../contexts/chatContext'
import Icon from 'react-native-vector-icons/Feather'
import { decodeMessageAsymetric, encodeMessageAsymetric } from '../utils/calculate'

const shadow = {
    shadowColor: "#000",
    shadowOffset: {
        width: 100,
        height: 100,
    },
    shadowOpacity: 100,
    shadowRadius: 100,

    elevation: 5,
}
export default function Chat({navigation}) {
    const {chatFunctions,chatState,socket} = useContext(chatContext)
    const scrollViewRef = useRef()
    const [messages, setmessages] = useState([])
    const [message, setMessage] = useState("")
    useEffect(() => {
        if(chatState["SelectedUser"] && chatState["SelectedUser"]["messages"]){
            setmessages(chatState["SelectedUser"]["messages"])
        }
    }, [chatState])
    const sendMessage = () => {
        if(message.length>0){
            let senderKeypair = chatState["User"]["keyPair"]
            let receiverPublicKey = Buffer.from(chatState["SelectedUser"]["publicKey"],"hex")
            // console.log("senderKeypair : ",senderKeypair)
            // console.log("receiverPublicKey : ",receiverPublicKey)
            let encodedMessage = encodeMessageAsymetric(message,senderKeypair,receiverPublicKey) 
            // console.log("encodedMessage : ",encodedMessage)
            // console.log('chatState["SelectedUser"]["socketId"] : ',chatState["SelectedUser"]["socketId"])
            chatFunctions.SendMessage({
                socket,
                s:encodedMessage.s,
                r:encodedMessage.r,
                nonce:encodedMessage.nonce,
                to : chatState["SelectedUser"]["userUid"],
                socketId : chatState["SelectedUser"]["socketId"]
            }).then(()=>{
                setMessage("")
            })    
        }
    }
    return (
        <View style={styles.container}>
            <View style={{height:StatusBar.currentHeight,backgroundColor:"#000"}}/>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={{padding:15}} 
                    onPress={()=>{
                        navigation.goBack()
                    }}
                >
                    <Icon name={"arrow-left"} size={25} color={"white"} />
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection:"row",alignItems:"center",flex:1}}>
                <View style={{marginRight:10,height:10,width:10,borderRadius:10,backgroundColor:chatState["SelectedUser"]["connected"] ? "green" :"red"}}/>
                    {/* <Image source={{uri:route.params.avatar}} style={{width:40,height:40,borderRadius:40}} /> */}
                    <Text style={{color:"white",fontSize:12,padding:10}}>
                        {chatState["SelectedUser"]["userUid"]}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{padding:15}} 
                    onPress={()=>{
                        navigation.navigate("call",{userUid:chatState["SelectedUser"]["userUid"]})
                    }}>
                    <Icon name={"phone"} size={25} color={"white"} />
                </TouchableOpacity>
                <TouchableOpacity style={{padding:15}}>
                    <Icon name={"video"} size={25} color={"white"} />
                </TouchableOpacity>
            </View>
            <View style={{flex:1}}>
                <ScrollView ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })} style={{width:"100%"}}>
                    <View style={{marginTop:20}}/>
                    <View style={{width:"100%",alignItems:"center",marginBottom:20}}>
                        <View style={{width:"80%",backgroundColor:"#fad964",borderRadius:5,padding:15,flexDirection:"row",alignItems:"center",}}>
                            <View style={{margin:10}}>
                                <Icon name={"lock"} size={13} color={"black"} />
                            </View>
                            <Text style={{textAlign:"center"}}>
                                End to end encrypted
                            </Text>
                        </View>
                    </View>
                    {messages?.map((message,i)=>{
                        return(
                            <View key={i} style={{alignItems:(message.forSelf === false) ? "flex-end" : (null) }}>
                                <Text style={styles.message}>
                                    {/* {JSON.stringify(message)} */}
                                    {/* {console.log(message)} */}

                                    {message.text}
                                    {/* {JSON.stringify(message.forSelf)} */}
                                </Text>
                            </View>
                        )
                    })}
                </ScrollView>
                <View style={styles.footer}>
                    <View style={styles.input}>
                        <TextInput
                            onFocus={()=>{
                                scrollViewRef.current.scrollToEnd({animated:true})
                            }}
                            value={message}
                            onChangeText={setMessage}
                            placeholder={"Taper message"}
                            style={{flex:1,paddingLeft:20}}
                            multiline
                        />
                    </View>
                    <TouchableOpacity onPress={sendMessage} style={{backgroundColor:"grey",padding:10,borderRadius:25,marginLeft:10,marginRight:10,...shadow}}>
                        <Icon style={{padding:5,}} name={(message.length>0)?"send":"mic"} size={20} color={"white"} />
                    </TouchableOpacity>
                </View>
            </View>
            
            
            
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex:1,
        width:Dimensions.get("screen").width,
        height:Dimensions.get('screen').height,
        backgroundColor:"#444444"
    },
    header:{
        width:Dimensions.get("screen").width,
        backgroundColor:"#000",
        flexDirection:"row",
        alignItems:"center",
        
    },
    message:{
        justifyContent:"center",
        minHeight:30,
        maxWidth:Dimensions.get("screen").width*0.66,
        padding:10,
        backgroundColor:"white",
        margin:2,
        marginLeft:10,
        marginRight:10,
        borderRadius:10,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 100,
        shadowRadius: 10,
        
        elevation: 10,
    },
    footer:{
        width:"100%",
        opacity:1,
        flexDirection:"row",
        alignItems:"center",
        maxHeight:120,
    },
    input:{
        backgroundColor:"white",
        borderRadius:30,
        flex:1,
        margin:5,
        flexDirection:'row',
        alignItems:"center",
        justifyContent:"space-between",
    },
})
