import { db, storage } from "./config";
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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const COLLECTION = "blogPosts";

// Helper function to convert Firestore timestamps to JavaScript Date objects
const convertTimestamps = (data) => {
  const result = { ...data };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  }
  return result;
};

// Helper function to clean up data before saving to Firestore
const cleanBlogData = (data) => {
  const cleanedData = JSON.parse(JSON.stringify(data));
  Object.keys(cleanedData).forEach((key) => {
    if (cleanedData[key] === undefined) {
      cleanedData[key] = null;
    }
  });
  return cleanedData;
};

export async function getBlogPosts() {
  try {
    const blogPostsRef = collection(db, COLLECTION);
    const q = query(blogPostsRef);
    const querySnapshot = await getDocs(q);
    const blogPosts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const convertedData = convertTimestamps(data);
      return {
        id: doc.id,
        ...convertedData,
      };
    });
    return { success: true, blogPosts };
  } catch (error) {
    console.error("Error getting blog posts from Firestore:", error);
    return { success: false, error: error.message || "Failed to fetch blog posts" };
  }
}

export async function getBlogPost(id) {
  try {
    const blogPostRef = doc(db, COLLECTION, id);
    const blogPostDoc = await getDoc(blogPostRef);
    if (!blogPostDoc.exists()) {
      throw new Error("Blog post not found");
    }
    const data = blogPostDoc.data();
    const convertedData = convertTimestamps(data);
    const blogPost = {
      id: blogPostDoc.id,
      ...convertedData,
    };
    return { success: true, blogPost };
  } catch (error) {
    console.error("Error getting blog post:", error);
    return { success: false, error: error?.message };
  }
}

export async function addBlogPost(blogData) {
  try {
    const cleanedData = cleanBlogData(blogData);
    const blogWithTimestamp = {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, COLLECTION), blogWithTimestamp);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error in Firebase addBlogPost:", error);
    return {
      success: false,
      error: error.message || "Failed to add blog post to database",
    };
  }
}

export async function updateBlogPost(id, blogData) {
  try {
    const cleanedData = cleanBlogData(blogData);
    const blogPostRef = doc(db, COLLECTION, id);
    const blogWithTimestamp = {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(blogPostRef, blogWithTimestamp);
    return { success: true };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlogPost(id) {
  try {
    if (!id) {
      console.error("Invalid blog post ID provided for deletion");
      return { success: false, error: "Invalid blog post ID" };
    }
    const blogPostRef = doc(db, COLLECTION, id);
    await deleteDoc(blogPostRef);
    return { success: true, id };
  } catch (error) {
    console.error("Error in deleteBlogPost:", error);
    return {
      success: false,
      error: error.message || "Failed to delete blog post",
    };
  }
}

export async function uploadBlogImage(file, blogId) {
  try {
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `blogPosts/${blogId}/${uniqueFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error("Error in uploadBlogImage:", error);
    return {
      success: false,
      error: error.message || "Failed to upload image",
    };
  }
}

export async function deleteBlogImage(imagePath) {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message };
  }
}
