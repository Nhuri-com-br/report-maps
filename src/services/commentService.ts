import {
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  increment,
  writeBatch
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
      const comments = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id,
        createdAt: d.data().createdAt?.toMillis() || Date.now(),
      } as Comment));
      callback(comments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, getCommentsPath(issueId));
    });
  },

  addComment: async (issueId: string, text: string, fromAdmin: boolean) => {
    if (!auth.currentUser) throw new Error('User must be logged in');

    const docId = Math.random().toString(36).substr(2, 9);
    const path = `${getCommentsPath(issueId)}/${docId}`;

    try {
      // Comentário e contador são gravados juntos: ou os dois entram, ou nenhum
      const batch = writeBatch(db);
      batch.set(doc(db, 'issues', issueId, 'comments', docId), {
        id: docId,
        issueId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anônimo',
        text,
        createdAt: serverTimestamp(),
        fromAdmin,
      });
      batch.update(doc(db, 'issues', issueId), { commentsCount: increment(1) });
      await batch.commit();

      return docId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};