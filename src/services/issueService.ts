/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UrbanIssue, IssueType } from '../types';

const ISSUES_COLLECTION = 'issues';

export const issueService = {
  subscribeToIssues: (callback: (issues: UrbanIssue[]) => void) => {
    const q = query(collection(db, ISSUES_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const issues = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      } as UrbanIssue));
      callback(issues);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ISSUES_COLLECTION);
    });
  },

  createIssue: async (data: Omit<UrbanIssue, 'id' | 'reporterId' | 'reporterName' | 'createdAt' | 'likesCount' | 'likedBy'>) => {
    if (!auth.currentUser) throw new Error('User must be logged in');

    const issueData = {
      ...data,
      reporterId: auth.currentUser.uid,
      reporterName: auth.currentUser.displayName || 'Anônimo',
      createdAt: serverTimestamp(),
      likesCount: 0,
      likedBy: [],
      status: 'pending' as const,
    };

    const docId = Math.random().toString(36).substr(2, 9);
    const path = `${ISSUES_COLLECTION}/${docId}`;
    
    try {
      await setDoc(doc(db, ISSUES_COLLECTION, docId), { ...issueData, id: docId });
      return docId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  toggleLike: async (issueId: string, isLiked: boolean) => {
    if (!auth.currentUser) throw new Error('User must be logged in');

    const path = `${ISSUES_COLLECTION}/${issueId}`;
    try {
      await updateDoc(doc(db, ISSUES_COLLECTION, issueId), {
        likesCount: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateStatus: async (issueId: string, status: UrbanIssue['status']) => {
    const path = `${ISSUES_COLLECTION}/${issueId}`;
    try {
      await updateDoc(doc(db, ISSUES_COLLECTION, issueId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
