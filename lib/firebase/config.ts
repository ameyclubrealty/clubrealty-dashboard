import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Log Firebase config for debugging
console.log("Firebase Config Status: ",{
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓" : "✗",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓" : "✗",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓" : "✗",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓" : "✗",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓" : "✗",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓" : "✗",
})

// Initialize Firebase
import type { FirebaseApp } from "firebase/app"
import type { Auth } from "firebase/auth"
import type { Firestore } from "firebase/firestore"
import type { FirebaseStorage } from "firebase/storage"

let app: FirebaseApp
try {
  if (!getApps().length) {
    console.log("Initializing new Firebase app...")
    app = initializeApp(firebaseConfig)
  } else {
    console.log("Using existing Firebase app...")
    app = getApp()
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  throw error
}

// Initialize services
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  console.log("Initializing Firebase auth...")
  auth = getAuth(app)

  console.log("Initializing Firestore...")
  db = getFirestore(app)

  console.log("Initializing Firebase storage...")
  storage = getStorage(app)

  console.log("All Firebase services initialized successfully!")
} catch (error) {
  console.error("Error initializing Firebase services:", error)
  throw error
}

export { app, auth, db, storage }
