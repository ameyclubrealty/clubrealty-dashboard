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
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


const COLLECTION = "blogPosts";

// Helper function to convert Firestore timestamps to JavaScript Date objects
const convertTimestamps = (data: any) => {
  const result = { ...data };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  }
  return result;
};

// Helper function to clean up data before saving to Firestore
const cleanBlogData = (data: any) => {
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
  } catch (error: any) {
    console.error("Error getting blog posts from Firestore:", error);
    return { success: false, error: error.message || "Failed to fetch blog posts" };
  }
}

export async function getBlogPost(id: string) {
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
  } catch (error: any) {
    console.error("Error getting blog post:", error);
    return { success: false, error: error?.message };
  }
}

export async function addBlogPost(blogData: any) {
  try {
    const cleanedData = cleanBlogData(blogData);
    const blogWithTimestamp = {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, COLLECTION), blogWithTimestamp);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error in Firebase addBlogPost:", error);
    return {
      success: false,
      error: error.message || "Failed to add blog post to database",
    };
  }
}

export async function updateBlogPost(id: string, blogData: any) {
  try {
    const cleanedData = cleanBlogData(blogData);
    const blogPostRef = doc(db, COLLECTION, id);
    const blogWithTimestamp = {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(blogPostRef, blogWithTimestamp);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    if (!id) {
      console.error("Invalid blog post ID provided for deletion");
      return { success: false, error: "Invalid blog post ID" };
    }
    const blogPostRef = doc(db, COLLECTION, id);
    await deleteDoc(blogPostRef);
    return { success: true, id };
  } catch (error: any) {
    console.error("Error in deleteBlogPost:", error);
    return {
      success: false,
      error: error.message || "Failed to delete blog post",
    };
  }
}

export async function uploadBlogImage(file: File, blogId: string) {
  try {
    // If blogId is not provided, use a temporary folder
    const folderPath = blogId ? `blogPosts/${blogId}` : 'blogPosts/temp';
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folderPath}/${uniqueFileName}`);
    
    console.log('Uploading to path:', `${folderPath}/${uniqueFileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Upload successful, URL:', downloadURL);
    
    return { 
      success: true, 
      url: downloadURL,
      path: `${folderPath}/${uniqueFileName}` // Return the path for potential cleanup
    };
  } catch (error: any) {
    console.error("Error in uploadBlogImage:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to upload image";
    if (error.code === 'storage/unauthorized') {
      errorMessage = "Storage access denied. Please check Firebase Storage rules.";
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = "Storage quota exceeded. Please try a smaller image.";
    } else if (error.code === 'storage/invalid-format') {
      errorMessage = "Invalid file format. Please use JPG, PNG, or GIF.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteBlogImage(imagePath: string) {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message };
  }
}

// Fetch a blog post by its slug
export async function getBlogPostBySlug(slug: string) {
  try {
    const blogPostsRef = collection(db, COLLECTION);
    const q = query(blogPostsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("Blog post not found");
    }
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    const convertedData = convertTimestamps(data);
    const blogPost = {
      id: docSnap.id,
      ...convertedData,
    };
    return { success: true, blogPost };
  } catch (error: any) {
    console.error("Error getting blog post by slug:", error);
    return { success: false, error: error?.message };
  }
}

// Update a blog post by its slug (finds the doc, then updates by ID)
export async function updateBlogPostBySlug(slug: string, blogData: any) {
  try {
    const blogPostsRef = collection(db, COLLECTION);
    const q = query(blogPostsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("Blog post not found for slug: " + slug);
    }
    const docRef = querySnapshot.docs[0].ref;
    const cleanedData = cleanBlogData(blogData);
    const blogWithTimestamp = {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, blogWithTimestamp);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating blog post by slug:", error);
    return { success: false, error: error.message };
  }
}
