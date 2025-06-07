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

const COLLECTION = "leads"

export async function getLeads() {
  try {
    const leadsRef = collection(db, COLLECTION)
    const q = query(leadsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const leads = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, leads };

  } catch (error: any) {
    console.error("Error getting leads:", error)
    return { success: false, error: error.message };
  }
}

export async function getLead(id: string) {
  try {
    const leadRef = doc(db, COLLECTION, id)
    const leadDoc = await getDoc(leadRef)

    if (!leadDoc.exists()) {
      throw new Error("Lead not found")
    }

    const lead = {
      id: leadDoc.id,
      ...leadDoc.data(),
    }

    return { success: true, lead }
  } catch (error: any) {
    console.error("Error getting lead:", error)
    return { success: false, error: error.message }
  }
}

export async function addLead(leadData: any) {
  try {
    const leadWithTimestamp = {
      ...leadData,
      status: leadData.status || "New",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION), leadWithTimestamp)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Error adding lead:", error)
    return { success: false, error: error.message }
  }
}

export async function updateLead(id: string, leadData: any) {
  try {
    const leadRef = doc(db, COLLECTION, id)

    const leadWithTimestamp = {
      ...leadData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(leadRef, leadWithTimestamp)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating lead:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteLead(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting lead:", error)
    return { success: false, error: error.message }
  }
}
