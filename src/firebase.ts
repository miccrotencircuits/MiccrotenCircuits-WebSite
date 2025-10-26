import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjz_l7n-4n9-osOewivWkmsnr5OV9gJXg",
  authDomain: "miccrotencircuits03.firebaseapp.com",
  projectId: "miccrotencircuits03",
  storageBucket: "miccrotencircuits03.appspot.com",
  messagingSenderId: "19653044045",
  appId: "1:19653044045:web:b75fac3585d51663973904",
  measurementId: "G-1M6FSF7NLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth instance
export const auth = getAuth(app);