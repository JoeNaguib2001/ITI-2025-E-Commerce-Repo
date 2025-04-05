
        // Import the functions you need from the SDKs you need
        // Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
        import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
        // TODO: Add SDKs for Firebase products that you want to use
        // https://firebase.google.com/docs/web/setup#available-libraries
      
        // Your web app's Firebase configuration
        const firebaseConfig = {
          apiKey: "AIzaSyBCDfTghFj89jNnYM3oz0LSGZU_FEi5s3c",
          authDomain: "iti-2025-e-commerce.firebaseapp.com",
          projectId: "iti-2025-e-commerce",
          storageBucket: "https://iti-2025-e-commerce-default-rtdb.firebaseio.com",
          messagingSenderId: "90149751365",
          appId: "1:90149751365:web:839d4d987cbcafd36b712c"
        };
      
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        console.log("Firebase App:", app);

        const db = getDatabase();
        export { db };
