import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function addSlugsToOldPosts() {
  const blogPostsRef = collection(db, 'blogPosts');
  const snapshot = await getDocs(blogPostsRef);
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!data.slug && data.title) {
      const slug = generateSlug(data.title);
      await updateDoc(doc(db, 'blogPosts', docSnap.id), { slug });
      console.log(`Updated ${docSnap.id} with slug: ${slug}`);
    }
  }
  console.log('Slug update complete.');
}

addSlugsToOldPosts().catch(console.error); 