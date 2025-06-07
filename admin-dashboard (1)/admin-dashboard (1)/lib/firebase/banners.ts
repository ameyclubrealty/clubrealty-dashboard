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
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

const COLLECTION = "banners"

export async function getBanners() {
  try {
    const bannersRef = collection(db, COLLECTION)
    const q = query(bannersRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const banners = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, banners }
  } catch (error: any) {
    console.error("Error getting banners:", error)
    return { success: false, error: error.message }
  }
}

export async function getBanner(id: string) {
  try {
    const bannerRef = doc(db, COLLECTION, id)
    const bannerDoc = await getDoc(bannerRef)

    if (!bannerDoc.exists()) {
      throw new Error("Banner not found")
    }

    const banner = {
      id: bannerDoc.id,
      ...bannerDoc.data(),
    }

    return { success: true, banner }
  } catch (error: any) {
    console.error("Error getting banner:", error)
    return { success: false, error: error.message }
  }
}

export async function addBanner(bannerData: any) {
  try {
    const bannerWithTimestamp = {
      ...bannerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION), bannerWithTimestamp)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error("Error adding banner:", error)
    return { success: false, error: error.message }
  }
}

export async function updateBanner(id: string, bannerData: any) {
  try {
    const bannerRef = doc(db, COLLECTION, id)

    const bannerWithTimestamp = {
      ...bannerData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(bannerRef, bannerWithTimestamp)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating banner:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteBanner(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting banner:", error)
    return { success: false, error: error.message }
  }
}

export async function uploadBannerImage(file: File, bannerId: string) {
  try {
    const storageRef = ref(storage, `banners/${bannerId}/${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return { success: true, url: downloadURL }
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteBannerImage(imagePath: string) {
  try {
    const storageRef = ref(storage, imagePath)
    await deleteObject(storageRef)

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting image:", error)
    return { success: false, error: error.message }
  }
}
