import { db } from "../firebase/firebaseInit";
import { getDoc, setDoc, doc, updateDoc } from "firebase/firestore";

/**
 * Retrieves a document from a collection in Firestore.
 * @param collection - The name of the collection.
 * @param document - The ID of the document.
 * @returns The data of the document.
 */
export const getDocument = async (collection: string, document: string) => {
  const data = doc(db, collection, document);
  const docData = (await getDoc(data)).data();
  return docData;
};

/**
 * Retrieves a specific record from a document in Firestore.
 * @param collection - The name of the collection.
 * @param document - The ID of the document.
 * @param record - The name of the record.
 * @returns The value of the record, or "Record not found." if the record does not exist.
 */
export const getRecord = async (
  collection: string,
  document: string,
  record: string
) => {
  const data = doc(db, collection, document);
  const docData = (await getDoc(data)).data();
  return docData?.[record] || "Record not found.";
};

/**
 * Sets a specific record in a document in Firestore.
 * @param collection - The name of the collection.
 * @param document - The ID of the document.
 * @param record - The name of the record.
 * @param data - The data to set for the record.
 */
export const setRecord = async (
  collection: string,
  document: string,
  record: string,
  data: any
) => {
  const docRef = doc(db, collection, document);
  await updateDoc(docRef, {
    [record]: data,
  });
};

/**
 * Sets a document in Firestore.
 * @param collection - The name of the collection.
 * @param document - The ID of the document.
 * @param data - The data to set for the document.
 */
export const setDocument = async (
  collection: string,
  document: string,
  data: any
) => {
  await setDoc(doc(db, collection, document), data);
};

/**
 * Updates a document in Firestore.
 * @param collection - The name of the collection.
 * @param document - The ID of the document.
 * @param data - The data to update the document with.
 */
export const updateDocument = async (
  collection: string,
  document: string,
  data: any
) => {
  await updateDoc(doc(db, collection, document), data);
};
