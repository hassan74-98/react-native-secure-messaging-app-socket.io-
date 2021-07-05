import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
export default function Call({navigation,route}) {
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>{}} style={[{position:"absolute",top:0,left:0,padding:20}]}>
                    <Icon name={"chevron-down"} size={32} color={"white"} />
                </TouchableOpacity>
            </View>
            <View style={{alignItems:"center"}}>
                <Text style={{color:"white",fontSize:30}}>
                    {"route.params.name"}
                </Text>
                <Text style={{color:"white"}}>
                    appel en cours
                </Text>
            </View>
            <View style={styles.body}>
                {/* <Image source={{uri:route.params.avatar}} style={{width:"100%",height:"100%"}}/> */}
                <View style={{position:"absolute",bottom:0,width:"100%",alignItems:"center",marginBottom:30}}>
                    <TouchableOpacity onPress={()=>{navigation.goBack()}} style={[{padding:20,backgroundColor:"red",borderRadius:40}]}>
                        <Icon name={"phone-off"} size={28} color={"white"} />
                    </TouchableOpacity>
                </View>
                
            </View>
            <View style={styles.footer}>
                <TouchableOpacity onPress={()=>{}} style={[{padding:20,borderRadius:40}]}>
                    <Icon name={"volume-2"} size={28} color={"white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{}} style={[{padding:20,borderRadius:40}]}>
                    <Icon name={"video"} size={28} color={"white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{}} style={[{padding:20,borderRadius:40}]}>
                    <Icon name={"mic-off"} size={28} color={"white"} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:"center",
    },
    header : {
        width:"100%",
        height:150,
        backgroundColor:"#265CD1",
        position:"relative",
        alignItems:"center",
        justifyContent:"center"
    },
    body:{
        flex:1,
        width:"100%",
        position:"relative",
    },
    footer:{
        width:"100%",
        height:100,
        backgroundColor:"#265CD1",
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-around"
    }
})
