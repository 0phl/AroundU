import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBAwn-6PWdt9sRXxzObM4pcBlVv5whc30w",
  authDomain: "aroundu-ef722.firebaseapp.com",
  projectId: "aroundu-ef722",
  storageBucket: "aroundu-ef722.firebasestorage.app",
  messagingSenderId: "722779773873",
  appId: "1:722779773873:web:f622798884cec41a2abb90",
  measurementId: "G-GPWW27MN26"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);