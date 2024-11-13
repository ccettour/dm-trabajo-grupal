import { Injectable } from '@angular/core';
import {collection, collectionData, deleteDoc, doc, Firestore, setDoc} from "@angular/fire/firestore";
import {firstValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  constructor(
    private firestore: Firestore,
  ) {
  }

  async guardarRecorrido(userId: string, datosRecorrido: any): Promise<void> {
    const recorridoDocRef = doc(this.firestore, `users/${userId}/historialRecorridos/${new Date().toISOString()}`);
    await setDoc(recorridoDocRef, datosRecorrido)
  }

  obtenerHistorialRecorridos(userId: string): Observable<any[]> {
    const historialRef = collection(this.firestore, `users/${userId}/historialRecorridos`);
    return collectionData(historialRef, { idField: 'id' });
  }

  // Nuevo metodo para eliminar un recorrido
  eliminarRecorrido(userId: string, recorridoId: string): Promise<void> {
    const recorridoDocRef = doc(this.firestore, `users/${userId}/historialRecorridos/${recorridoId}`);
    return deleteDoc(recorridoDocRef);
  }

  async ultimos5(userId: string){
    const recorridosObservable: Observable<any> = this.obtenerHistorialRecorridos(userId);
    const recorridos = await firstValueFrom(recorridosObservable);
    if(recorridos.length>5){
      await this.eliminarRecorrido(userId, recorridos[0].id);
    }
  }


}
