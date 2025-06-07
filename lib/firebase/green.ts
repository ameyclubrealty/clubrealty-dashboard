import {
    collection,
    query,
    getDocs,
    orderBy,
    doc,
    getDoc,
    where,
    setDoc,
    updateDoc,
    deleteDoc,
    DocumentData,
    QueryDocumentSnapshot,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

interface GreenData {
    name: string;
    phone: string;
    photo: string
}

const GO_GREEN_COLLECTION = "greenForms";

export async function getGoGreenData() {
  try {
    const goGreenRef = collection(db, GO_GREEN_COLLECTION);
    const q = query(goGreenRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data };

  } catch (error: any) {
    console.error("Error getting Go Green data:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGoGreenEntry(id: string) {
  try {
    await deleteDoc(doc(db, GO_GREEN_COLLECTION, id))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
};


export async function createGoGreenEntry({ name, phone, image }: { name: string, phone: string, image: string }) {
  try {
    const docRef = await addDoc(collection(db, GO_GREEN_COLLECTION), {
      name,
      phone,
      image,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };

  } catch (error: any) {
    console.error("Error creating Go Green entry:", error);
    return { success: false, error: error.message };
  }
}



