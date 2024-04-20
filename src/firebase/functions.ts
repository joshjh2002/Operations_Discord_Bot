import { db } from "../firebase/firebaseInit";
import { getDoc, setDoc, doc, updateDoc } from "firebase/firestore";

export const getDocument = async (collection: string, document: string) => {
  const data = doc(db, collection, document);
  const docData = (await getDoc(data)).data();
  return docData;
};

export const getRecord = async (
  collection: string,
  document: string,
  record: string
) => {
  const data = doc(db, collection, document);
  const docData = (await getDoc(data)).data();
  return docData?.[record] || "Record not found.";
};

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

export const setDocument = async (
  collection: string,
  document: string,
  data: any
) => {
  await setDoc(doc(db, collection, document), data);
};

export const updateDocument = async (
  collection: string,
  document: string,
  data: any
) => {
  await updateDoc(doc(db, collection, document), data);
};
