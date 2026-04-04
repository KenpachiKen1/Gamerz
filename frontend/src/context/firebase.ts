import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.firebase_key as string,
  authDomain: import.meta.env.authDomain as string,
  projectId: import.meta.env.projectId as string,
  appId: import.meta.env.appId as string,
  storageBucket: import.meta.env.storageBucket as string,
  messagingSenderId: import.meta.env.messagingSenderId as string,
  measurementId: import.meta.env.measurementId as string,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);