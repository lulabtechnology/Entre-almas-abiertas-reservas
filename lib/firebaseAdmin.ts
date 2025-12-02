import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;

/**
 * Devuelve una instancia única de Firestore (Admin).
 * Solo se ejecuta de verdad cuando se llama por primera vez
 * desde un endpoint /api.
 */
export function getDb(): Firestore {
  if (db) {
    return db;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyEnv) {
    throw new Error(
      "Faltan variables de entorno de Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)."
    );
  }

  // El private_key del JSON viene con "\n" dentro de la cadena
  const privateKey = privateKeyEnv.replace(/\\n/g, "\n");

  if (!getApps().length) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
  } else {
    app = getApps()[0]!;
  }

  db = getFirestore(app);
  return db!;
}
