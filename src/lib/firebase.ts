import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { supabase } from "./supabase";

const firebaseConfig = {
  apiKey: "AIzaSyDq3vyNquFbWLG_TpRC8eOZoLV1Z8NpAgw",
  authDomain: "nextgen-learners5.firebaseapp.com",
  projectId: "nextgen-learners5",
  storageBucket: "nextgen-learners5.firebasestorage.app",
  messagingSenderId: "1000946085872",
  appId: "1:1000946085872:web:04cbbf687928b06520f735"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, supabase };
