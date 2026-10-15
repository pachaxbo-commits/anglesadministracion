/**
 * Firebase Configuration - Configuración de Firebase
 * 
 * Este archivo inicializa Firebase con los servicios:
 * - Auth: Para login/logout de las propietarias
 * - Firestore: Para guardar productos, doctores, ventas, etc.
 * 
 * NO usamos Storage (fotos) - es de pago.
 * Namespace en Firestore: apps/farmacia/*
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWYo9lGnBspmgfdMaQhKemuvscUwAnpZQ",
    authDomain: "farmacia-app-ca93d.firebaseapp.com",
    projectId: "farmacia-app-ca93d",
    storageBucket: "farmacia-app-ca93d.firebasestorage.app",
    messagingSenderId: "535239259276",
    appId: "1:535239259276:web:8a25936b74a000bd1e77a9"
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig)

// Exporta los servicios que usaremos
export const auth = getAuth(app)           // Para autenticación
export const db = getFirestore(app)         // Para base de datos

// Prefijo para las colecciones en Firestore
export const FIRESTORE_PREFIX = 'apps/farmacia'

export default app
