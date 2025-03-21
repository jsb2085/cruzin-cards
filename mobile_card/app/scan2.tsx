import React, { useState, useEffect, useRef } from "react";
 import {
   View,
   Text,
   TouchableOpacity,
   Image,
   StyleSheet,
   ActivityIndicator,
   Alert,
   ScrollView,
 } from "react-native";
 import { Camera, CameraView } from "expo-camera";
 import AsyncStorage from "@react-native-async-storage/async-storage";
 import axios from "axios";

 const API_URL =
   "http://127.0.0.1:8000/api/upload/"; // Replace with your backend URL

 export default function UploadCard() {
   const [hasPermission, setHasPermission] = useState(null);
   const [uploading, setUploading] = useState(false);
   const [frontImage, setFrontImage] = useState(null);
   const [backImage, setBackImage] = useState(null);
   const [isCapturingBack, setIsCapturingBack] = useState(false);
   const cameraRef = useRef(null);

   useEffect(() => {
     (async () => {
       const { status } = await Camera.requestCameraPermissionsAsync();
       setHasPermission(status === "granted");
     })();
   }, []);

   const uploadImages = async () => {
     if (!frontImage || !backImage) {
       Alert.alert("Error", "Both images must be captured before uploading.");
       return;
     }

     const formData = new FormData();
     formData.append("card_front_image", {
       uri: frontImage,
       name: "front.jpg",
       type: "image/jpeg",
     });
     formData.append("card_back_image", {
       uri: backImage,
       name: "back.jpg",
       type: "image/jpeg",
     });

     setUploading(true);
     try {
       const token = await AsyncStorage.getItem("access_token");
       const response = await axios.post(API_URL, formData, {
         headers: {
           Authorization: `Bearer ${token}`,
           "Content-Type": "multipart/form-data",
         },
       });
       console.log("Upload success:", response.data);
       Alert.alert("Success", "Images uploaded successfully!");
     } catch (error) {
       console.error("Upload error:", error.response?.data || error.message);
       Alert.alert(
         "Error",
         `Upload failed: ${JSON.stringify(
           error.response?.data || error.message
         )}`
       );
     } finally {
       setUploading(false);
     }
   };

   const takePicture = async () => {
     if (cameraRef.current) {
       const photo = await cameraRef.current.takePictureAsync();
       if (isCapturingBack) {
         setBackImage(photo.uri);
       } else {
         setFrontImage(photo.uri);
         // Automatically switch to back after capturing front
         setIsCapturingBack(true);
         Alert.alert("Switching", "Now capture the back of the card.");
       }
     }
   };

   if (hasPermission === null) {
     return <View />;
   }

   if (hasPermission === false) {
     return <Text>No access to camera</Text>;
   }

   return (
     <ScrollView>
       <View style={styles.container}>
         <CameraView ref={cameraRef} style={styles.camera} facing="back">
           <View style={styles.overlay}>
             <View style={styles.guideBox} />
           </View>
         </CameraView>

         {frontImage && backImage && (
           <TouchableOpacity onPress={uploadImages} style={styles.uploadButton}>
             <Text style={styles.text}>Upload Images</Text>
           </TouchableOpacity>
         )}

         {/* Buttons Below the Camera View */}
         <View style={styles.buttonContainer}>
           <TouchableOpacity onPress={takePicture} style={styles.button}>
             <Text style={styles.text}>
               Capture {isCapturingBack ? "Back" : "Front"} Image
             </Text>
           </TouchableOpacity>

           <TouchableOpacity
             onPress={() => setIsCapturingBack(!isCapturingBack)}
             style={styles.button}
           >
             <Text style={styles.text}>
               Switch to {isCapturingBack ? "Front" : "Back"}
             </Text>
           </TouchableOpacity>
         </View>

         {frontImage && (
           <Image source={{ uri: frontImage }} style={styles.image} />
         )}
         {backImage && (
           <Image source={{ uri: backImage }} style={styles.image} />
         )}

         {uploading && <ActivityIndicator size="large" color="#0000ff" />}
       </View>
     </ScrollView>
   );
 }

 const styles = StyleSheet.create({
   container: {
     flex: 1,
     justifyContent: "center",
     alignItems: "center",
     padding: 10,
   },
   camera: {
     width: "100%",
     height: 550,
     borderRadius: 10,
     overflow: "hidden",
   },
   overlay: {
     ...StyleSheet.absoluteFillObject,
     alignItems: "center",
   },
   guideBox: {
     top: 75,
     width: 300,
     height: 400,
     borderColor: "red",
     borderWidth: 3,
     borderRadius: 10,
     backgroundColor: "rgba(0,0,0,0.2)",
   },
   buttonContainer: {
     flexDirection: "row",
     justifyContent: "space-around",
     marginTop: 20,
   },
   button: {
     backgroundColor: "#fff",
     padding: 15,
     borderRadius: 10,
   },
   uploadButton: {
     backgroundColor: "green",
     padding: 15,
     borderRadius: 10,
     marginTop: 20,
   },
   text: {
     fontSize: 16,
     color: "#000",
   },
   image: {
     width: 300,
     height: 400,
     marginVertical: 10,
     borderRadius: 8,
   },
 });