// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    // TODO: Replace with your Firebase project configuration
    // Go to Firebase Console -> Project Settings -> General -> Your Apps -> Web App
    // Copy the configuration object and paste it here
    apiKey: "AIzaSyC7WlxhKE9qFrFPYb6F5DakotmFO5rMRWQ",
    authDomain: "bfpt-82bd2.firebaseapp.com",
    projectId: "bfpt-82bd2",
    storageBucket: "bfpt-82bd2.firebasestorage.app",
    messagingSenderId: "140272546150",
    appId: "1:140272546150:web:1eddff38f300293c3118a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the Firestore instance
export { db, collection, doc, setDoc, getDocs }; 