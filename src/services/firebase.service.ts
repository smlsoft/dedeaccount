import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCdaK9B_08CLPQSB_6KgyAmKmkI2PmZKMw",
  authDomain: "dedepos.firebaseapp.com",
  projectId: "dedepos",
  storageBucket: "dedepos.appspot.com",
  messagingSenderId: "183871505957",
  appId: "1:183871505957:web:bd14d4d10faf0b5007a1cc",
  measurementId: "G-Y3Y46JER2D"
};

export const setup = () => { initializeApp(firebaseConfig) }