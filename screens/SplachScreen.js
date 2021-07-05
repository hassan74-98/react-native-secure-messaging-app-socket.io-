import React from 'react'
import { StyleSheet, Text, View,Image } from 'react-native'

export default function SplachScreen() {
    return (
        <View style={styles.container}>
            {/* <Image source={require('../assets/composer.png')} style={styles.icon} /> */}
            <Image style={styles.splashIcon} source={require('../assets/GR.png')}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent : "center",
        alignItems:"center",
        backgroundColor:"black"
    },
    splashIcon:{
        width:70,
        height:100
    }
})
