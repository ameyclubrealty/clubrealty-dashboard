import { db, storage } from "./config"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

const COLLECTION = "properties"

// Helper function to convert Firestore timestamps to JavaScript Date objects
const convertTimestamps = (data) => {
  const result = { ...data }

  // Convert Firestore timestamps to JavaScript Date objects
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate()
    }
  }

  return result
}

// Helper function to clean up data before saving to Firestore
const cleanPropertyData = (data) => {
  // Create a deep copy to avoid modifying the original
  const cleanedData = JSON.parse(JSON.stringify(data))

  // Remove undefined values which Firestore doesn't handle well
  Object.keys(cleanedData).forEach((key) => {
    if (cleanedData[key] === undefined) {
      cleanedData[key] = null
    }
  })

  return cleanedData
}

// Update the getProperties function to handle Firestore data properly
export async function getProperties() {
  try {
    const propertiesRef = collection(db, COLLECTION)

    // Create a query that works even if createdAt doesn't exist on some documents
    const q = query(propertiesRef)

    const querySnapshot = await getDocs(q)

    const properties = querySnapshot.docs.map((doc) => {
      const data = doc.data()

      // Convert any Firestore timestamps to JavaScript Date objects
      const convertedData = convertTimestamps(data)

      return {
        id: doc.id,
        ...convertedData,
      }
    })

    return { success: true, properties }
  } catch (error) {
    console.error("Error getting properties from Firestore:", error)
    return { success: false, error: error.message || "Failed to fetch properties" }
  }
}

export async function getProperty(id: string) {
  try {
    const propertyRef = doc(db, COLLECTION, id)
    const propertyDoc = await getDoc(propertyRef)

    if (!propertyDoc.exists()) {
      throw new Error("Property not found")
    }

    const data = propertyDoc.data()

    // Convert any Firestore timestamps to JavaScript Date objects
    const convertedData = convertTimestamps(data)

    const property = {
      id: propertyDoc.id,
      ...convertedData,
    }

    return { success: true, property }
  } catch (error) {
    console.error("Error getting property:", error)
    return { success: false, error: error?.message }
  }
}

// Update the addProperty function to include the assignedSaleMemberPhoto field
export async function addProperty(propertyData: any) {
  try {
    // Clean the data before saving
    const cleanedData = cleanPropertyData(propertyData)

    // Ensure we have timestamps
    const propertyWithTimestamp = {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Ensure these fields are properly saved
      listingIntent: cleanedData.listingIntent || "",
      locationImageUrl: cleanedData.locationImageUrl || "",
      mapLink: cleanedData.mapLink || "",
      parkingAvailable: cleanedData.parkingAvailable === true,
      projectId: cleanedData.projectId || "",
      virtualTourLink: cleanedData.virtualTourLink || "",
      videos: cleanedData.videos || [],
      assignedSaleMember: cleanedData.assignedSaleMember || "",
      companyName: cleanedData.companyName || "",
      assignedSaleMemberPhone: cleanedData.assignedSaleMemberPhone || "",
      assignedSaleMemberPhoto: cleanedData.assignedSaleMemberPhoto || "",
    }

    const docRef = await addDoc(collection(db, COLLECTION), propertyWithTimestamp)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error in Firebase addProperty:", error)
    return {
      success: false,
      error: error.message || "Failed to add property to database",
    }
  }
}

// Update the updateProperty function to include the assignedSaleMemberPhoto field
export async function updateProperty(id: string, propertyData: any) {
  try {
    // Clean the data before saving
    const cleanedData = cleanPropertyData(propertyData)

    const propertyRef = doc(db, COLLECTION, id)

    const propertyWithTimestamp = {
      ...cleanedData,
      updatedAt: serverTimestamp(),
      // Ensure these fields are properly saved
      listingIntent: cleanedData.listingIntent || "",
      locationImageUrl: cleanedData.locationImageUrl || "",
      mapLink: cleanedData.mapLink || "",
      parkingAvailable: cleanedData.parkingAvailable === true,
      projectId: cleanedData.projectId || "",
      virtualTourLink: cleanedData.virtualTourLink || "",
      videos: cleanedData.videos || [],
      assignedSaleMember: cleanedData.assignedSaleMember || "",
      companyName: cleanedData.companyName || "",
      assignedSaleMemberPhone: cleanedData.assignedSaleMemberPhone || "",
      assignedSaleMemberPhoto: cleanedData.assignedSaleMemberPhoto || "",
    }

    await updateDoc(propertyRef, propertyWithTimestamp)

    return { success: true }
  } catch (error) {
    console.error("Error updating property:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteProperty(id: string) {
  try {
    if (!id) {
      console.error("Invalid property ID provided for deletion")
      return { success: false, error: "Invalid property ID" }
    }

    // Direct approach to delete the document
    const propertyRef = doc(db, COLLECTION, id)
    await deleteDoc(propertyRef)

    return { success: true, id }
  } catch (error: any) {
    console.error("Error in deleteProperty:", error)
    return {
      success: false,
      error: error.message || "Failed to delete property",
    }
  }
}

export async function uploadPropertyImage(file: File, propertyId: string) {
  try {
    // Create a unique filename to avoid collisions
    const uniqueFileName = `${Date.now()}_${file.name}`
    const storageRef = ref(storage, `properties/${propertyId}/${uniqueFileName}`)

    const snapshot = await uploadBytes(storageRef, file)

    const downloadURL = await getDownloadURL(snapshot.ref)

    return { success: true, url: downloadURL }
  } catch (error) {
    console.error("Error in uploadPropertyImage:", error)
    return {
      success: false,
      error: error.message || "Failed to upload image",
    }
  }
}

export async function deletePropertyImage(imagePath: string) {
  try {
    const storageRef = ref(storage, imagePath)
    await deleteObject(storageRef)

    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { success: false, error: error.message }
  }
}
