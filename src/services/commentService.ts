/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  increment,
  updateDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Comment } from '../types';

const getCommentsPath = (issueId: string) => `issues/${issueId}/comments`;

export const commentService = {
  subscribeToComments: (issueId: string, callback: (comments: Comment[]) => void) => {
    const q = query(
      collection(db, getCommentsPath(issueId)), 
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      } as Comment));
      callback(comments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, getCommentsPath(issueId));
    });
  },

  addComment: async (issueId: string, text: string) => {
    if (!auth.currentUser) throw new Error('User must be logged in');

    const commentData = {
      issueId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anônimo',
      userEmail: auth.currentUser.email || undefined,
      text,
      createdAt: serverTimestamp(),
    };

    const docId = Math.random().toString(36).substr(2, 9);
    const path = `${getCommentsPath(issueId)}/${docId}`;
    
    try {
      await setDoc(doc(db, 'issues', issueId, 'comments', docId), { ...commentData, id: docId });
      
      // Update issue comment count
      await updateDoc(doc(db, 'issues', issueId), {
        commentsCount: increment(1)
      });
      
      return docId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
