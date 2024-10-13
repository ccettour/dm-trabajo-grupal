import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  constructor(private firestore: Firestore) {}

  async actualizarPerfil(userId: string, datosPerfil: any): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    await setDoc(userDocRef, datosPerfil, { merge: true });
  }

  async obtenerDatosPerfil(userId: string): Promise<any> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  }
}

