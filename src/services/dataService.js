import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Reference to your 'divisions' collection in Firestore
const divisionsCollection = collection(db, "divisions");

export const fetchAllData = async () => {
  const snapshot = await getDocs(divisionsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addPersonnel = async (divisionId, newTeacher) => {
  // Logic to add a teacher to a specific division document
  const divisionRef = doc(db, "divisions", divisionId);
  // Implementation depends on how you structure your Firestore docs
};