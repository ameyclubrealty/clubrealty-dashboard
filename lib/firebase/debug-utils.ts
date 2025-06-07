import { db } from "./config"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"

export async function listAllProperties() {
  try {
    console.log("Listing all properties in Firestore...")
    const querySnapshot = await getDocs(collection(db, "properties"))

    const properties = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`Found ${properties.length} properties:`)
    properties.forEach((property, index) => {
      console.log(`${index + 1}. ID: ${property.id}, Title: ${property.title}`)
    })

    return { success: true, properties }
  } catch (error: any) {
    console.error("Error listing properties:", error)
    return { success: false, error: error.message }
  }
}

export async function checkPropertyExists(id: string) {
  try {
    console.log(`Checking if property with ID ${id} exists...`)
    const docRef = doc(db, "properties", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log(`Property with ID ${id} exists:`, docSnap.data())
      return { success: true, exists: true, data: docSnap.data() }
    } else {
      console.log(`Property with ID ${id} does not exist`)
      return { success: true, exists: false }
    }
  } catch (error: any) {
    console.error(`Error checking property ${id}:`, error)
    return { success: false, error: error.message }
  }
}
