import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCFUI4F1wM8Mkv_Q_SGWgdpnrgh5Z1b7_U",
  authDomain: "vaden-budget.firebaseapp.com",
  projectId: "vaden-budget",
  storageBucket: "vaden-budget.firebasestorage.app",
  messagingSenderId: "303882533032",
  appId: "1:303882533032:web:9e328ea0f8301d4f1aaa9d"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)