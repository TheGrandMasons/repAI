import { initializeApp } from "firebase/app";

const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDlNxcXq4GRQ51aQR8wB-wxRzADAiA4SO8",
    authDomain: "gdg-hkthn.firebaseapp.com",
    projectId: "gdg-hkthn",
    storageBucket: "gdg-hkthn.appspot.com",
    messagingSenderId: "1014970577985",
    appId: "1:1014970577985:web:ba7f8ca71d0b271ec682c0"
  }
};
const app = initializeApp(environment.firebase);
export {environment , app};
