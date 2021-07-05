import React, { useContext, useEffect, useState } from 'react'
import { Button, Dimensions, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
const d = Dimensions.get("screen")
import chatContext from '../contexts/chatContext'
const image = require('../assets/backgroundBlack1.jpg') ;
export default function Home({navigation}) {
    const {chatFunctions,chatState,socket} = useContext(chatContext)
    const [users, setusers] = useState([])
    const [search, setsearch] = useState(false)
    const [searchInput, setsearchInput] = useState("")
    const [isFocused, setisFocused] = useState(false)
    useEffect(() => {
        setusers(chatState["AllUsers"])
    }, [chatState])
    useEffect(() => {
        chatFunctions.RemoveSelectedUser()
    }, [])
    const lastMessage = (userUid)=>{
        if(users[userUid]){
            let AllMessages = users[userUid]?.["messages"]
            if(AllMessages?.length > 0 ){
                let message = AllMessages[AllMessages?.length - 1]
                return(message?.text)    
            }else{
                return("new conversation")
            }
            
        }
    }
    const onUserPressed = (uid) => {
        // console.log(uid)
        chatFunctions.SelectUser(uid).then(()=>{
            navigation.navigate("chat")
        })
    }
    const renderStatus = (userUid) => {
        let online = chatState["AllUsers"][userUid]["connected"]
        return(
            <View style={{alignItems:"center",flexDirection:"row"}}>
                <View style={{marginRight:10,height:8,width:8,borderRadius:10,backgroundColor:online ? "green" :"red"}}/>    
                <Text style={{color:"grey"}}>
                    {(online) ? "(available)" : ""}
                </Text>
            </View>
            
        )
    }
    
    return (
        <ImageBackground source={image} style={styles.ImageBackground}>
            <View style={{width:"100%",height:50,marginTop:StatusBar.currentHeight,paddingHorizontal:10}}>
                {(search) ? (
                    <View style={{width:"100%",alignItems:"center",justifyContent:"center",padding:20,flexDirection:"row"}}>
                        <TouchableOpacity 
                            style={{marginHorizontal:15}} 
                            onPress={()=>{
                                setsearch(false)
                                setsearchInput("")
                            }}
                        >
                            <Icon name={"arrow-left"} size={18} color={"white"} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input]}
                            // underlineColorAndroid={
                            //     isFocused ? "#428af8" : "white"
                            // }
                            
                            // placeholderTextColor= {(isFocused) ? "#428af8" : "white"}
                            onFocus={() => {setisFocused(true)}}
                            onBlur={()=>{setisFocused(false)}}
                            selectionColor={"#428af8"}
                            placeholder={(isFocused || searchInput.length > 0) ? "" : "Auto research"}
                            // label="pass phrase" 
                            value={searchInput}
                            onChangeText={setsearchInput}
                            // secureTextEntry={true}
                        />      
                    </View>
                      
                ) : (
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
                        <Text style={{color:"grey",fontSize:20}}>
                        SMSGR
                        </Text>
                        <View style={{flexDirection:"row",alignItems:"center",}}>
                            <TouchableOpacity 
                                style={{padding:15}} 
                                onPress={()=>{
                                    setsearch(true)
                                }}
                            >
                                <Icon name={"search"} size={18} color={"grey"} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                // style={{padding:15}} 
                                onPress={()=>{
                                    
                                }}
                            >
                                <Icon name={"more-vertical"} size={18} color={"grey"} />
                            </TouchableOpacity>
                        </View>    
                    </View>
                    
                )}
                
                
                
            </View>

            <ScrollView style={{width:"100%",marginBottom:40,}}>
                {Object.keys(chatState["AllUsers"]).map((userUid)=>{
                    if(userUid.includes(searchInput)){
                        return(
                            <TouchableOpacity 
                                onPress={()=>{
                                    onUserPressed(userUid)
                                }} 
                                key={userUid} 
                                style={[styles.chat]}>
                                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
                                    
                                    <Text style={{fontSize:15,color:"#fff"}}>
                                        {userUid}
                                    </Text>
                                    {renderStatus(userUid)}
                                    
                                </View>
                                {/* <Text style={{color:"white"}}>
                                    {JSON.stringify(users[userUid]["hasNewMessages"])}
                                </Text> */}
                                <Text style={{marginLeft:20,color:chatState["AllUsers"][userUid]["hasNewMessages"] ? "green" :"grey"}}>
                                    {lastMessage(userUid)}
                                </Text>
                            </TouchableOpacity>
                        )    
                    }
                    
                })}
                {/* <Button
                    title="LOGOUT"
                    onPress={()=>{
                        chatFunctions.LogOut(socket)
                    }}
                /> */}
                <View style={{marginBottom:50}}/>
            </ScrollView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container : {
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    ImageBackground: {
        position: 'absolute',
        flex: 1,
        resizeMode: "cover",
        width: d.width,
        height: d.height,
        alignItems: 'center',        
    },
    chat:{
        position:"relative",
        margin:5,
        padding:10,
        // height:70,
        borderBottomWidth:1,
        borderBottomColor : "grey",
        // backgroundColor:"white"
    },
    input: {
        width: 300,
        height: 40,
        // margin: 30,
        // marginBottom:15,
        textAlign:"center",
        backgroundColor:"grey",
        opacity:0.5
        // textAlignVertical: 'top',
    },
})
