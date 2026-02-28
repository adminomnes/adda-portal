import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA1g6UDmrcWXGqkKMdmONvjWPhp3-85JHY",
    authDomain: "imperia-42291.firebaseapp.com",
    projectId: "imperia-42291",
    storageBucket: "imperia-42291.firebasestorage.app",
    messagingSenderId: "757447533395",
    appId: "1:757447533395:web:ff0a13aa7111d0321237a6",
    measurementId: "G-M62MJZTT4L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
    try {
        console.log("Creando usuario admin@adda.cl...");
        const userCredential = await createUserWithEmailAndPassword(auth, "admin@adda.cl", "Admin1234");

        console.log("Usuario Auth creado, creando perfil admin...");
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Administrador ADDA",
            email: "admin@adda.cl",
            role: "admin",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log("¡Éxito! Admin creado con UID:", userCredential.user.uid);
        process.exit(0);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log("El usuario admin@adda.cl ya existe. Intentando forzar su rol a admin...");
            // No puedo actualizar el rol si ya existe sin admin SDK o sin loguearme como él primero en el cliente, 
            // pero podemos usar la API REST de identitytoolkit o loguearnos como él y actualizar su perfil.
        }
        console.error("Error completo:", error);
        process.exit(1);
    }
}

createAdmin();
