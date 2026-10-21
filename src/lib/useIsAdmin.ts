import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';

// Descobre se o usuário logado é admin (existe o documento admins/{uid})
export function useIsAdmin(user: User | null): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    getDoc(doc(db, 'admins', user.uid))
      .then((snap) => { if (!cancelled) setIsAdmin(snap.exists()); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, [user?.uid]);

  return isAdmin;
}