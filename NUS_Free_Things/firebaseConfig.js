// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoy4Qa0oMej08M7VayAkoPgsLxj-Z5uDo",
  authDomain: "nus-free-things.firebaseapp.com",
  projectId: "nus-free-things",
  storageBucket: "nus-free-things.appspot.com",
  messagingSenderId: "111516422505",
  appId: "1:111516422505:web:5e1d33fed64df7d2f12df8",
  measurementId: "G-X79RWF2KWD",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);