import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyD9_xS4NIAz_KyZ5u54AeS2u7nxDPQMhVI",
  authDomain: "cameramobile-b11b5.firebaseapp.com",
  projectId: "cameramobile-b11b5",
  storageBucket: "cameramobile-b11b5.firebasestorage.app",
  messagingSenderId: "598123801389",
  appId: "1:598123801389:web:7abd06987a8a06168e81a4",
  measurementId: "G-WM281N823R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
export { app, db, storage, auth };