// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore} from 'firebase/firestore'
import {getStorage, uploadBytes,ref,getDownloadURL, getMetadata} from "firebase/storage"
import { v4 } from "uuid";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt8j3Xn_B7a4xpJA7xmxL4dhupdsxu2P8",
  authDomain: "chat-so-738f0.firebaseapp.com",
  projectId: "chat-so-738f0",
  storageBucket: "chat-so-738f0.appspot.com",
  messagingSenderId: "465851236003",
  appId: "1:465851236003:web:f9e7054f9a152c394ec916"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage=getStorage(app);
export const auth = getAuth(app)
export const db = getFirestore(app)

export async function uploadFile(file){
  const name=v4()
  var type=""
  if (file.type==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
    type=".docx"
  }
  if (file.type==="application/pdf"){
    type=".pdf"
  }
  if (file.type==="video/mp4"){
    type=".mp4"
  }
  if (file.type==="audio/mpeg"){
    type=".mp3"
  }
  if (file.type==="audio/x-m4a"){
    type=".m4a"
  }
  console.log(file.type)
  const storageRef=ref(storage,(name+type));

  await uploadBytes(storageRef,file)
  const url=await getDownloadURL(storageRef)
  return [url,storageRef.fullPath]
}

export async function getType(name){
  const fileRef=ref(storage,name);
  const metadata= await getMetadata(fileRef)
  return metadata.contentType
}



