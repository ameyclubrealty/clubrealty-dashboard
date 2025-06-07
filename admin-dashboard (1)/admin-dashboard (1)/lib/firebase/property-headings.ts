import { db } from "./config"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"

const COLLECTION = "property-headings"

export async function getPropertyHeadings() {
  try {
    const headingsRef = collection(db, COLLECTION)
    const q = query(headingsRef, orderBy("order", "asc"))
    const querySnapshot = await getDocs(q)

    const headings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, headings }
  } catch (error: any) {
    console.error("Error getting property headings:", error)
    return { success: false, error: error.message }
  }
}

export async function getPropertyHeading(id: string) {
  try {
    const headingRef = doc(db, COLLECTION, id)
    const headingDoc = await getDoc(headingRef)

    if (!headingDoc.exists()) {
      throw new Error("Property heading not found")
    }

    const heading = {
      id: headingDoc.id,
      ...headingDoc.data(),
    }

    return { success: true, heading }
  } catch (error: any) {
    console.error("Error getting property heading:", error)
    return { success: false, error: error.message }
  }
}

export async function addPropertyHeading(headingData: any) {
  try {
    const headingWithTimestamp = {
      ...headingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION), headingWithTimestamp)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Error adding property heading:", error)
    return { success: false, error: error.message }
  }
}

export async function updatePropertyHeading(id: string, headingData: any) {
  try {
    const headingRef = doc(db, COLLECTION, id)

    const headingWithTimestamp = {
      ...headingData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(headingRef, headingWithTimestamp)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating property heading:", error)
    return { success: false, error: error.message }
  }
}

export async function deletePropertyHeading(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting property heading:", error)
    return { success: false, error: error.message }
  }
}
