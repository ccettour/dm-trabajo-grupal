import {Injectable} from '@angular/core';
import {doc, Firestore, getDoc, setDoc} from "@angular/fire/firestore";
import {BehaviorSubject} from "rxjs";
import {infinite} from "ionicons/icons";

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private mayorDistancia: number = 0;
  private menorTiempo: number = 0;
  private mayorDuracion: number = 0;
  private nuevoRecordDistanciaS:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  nuevoRecordDistancia$ = this.nuevoRecordDistanciaS.asObservable();
  private nuevoRecordTiempoS:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  nuevoRecordTiempo$ = this.nuevoRecordTiempoS.asObservable();
  private nuevoRecordDuracionS:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  nuevoRecordDuracion$ = this.nuevoRecordDuracionS.asObservable();

  constructor(private firestore: Firestore) {
  }

  // async actualizarEstadisticas(userId: string, nuevasEstadisticas: any): Promise<void> {
  //   try {
  //     const userDocRef = doc(this.firestore, `users/${userId}/estadisticas/data`);
  //
  //     // Obtener los valores actuales
  //     const estadisticasSnapshot = await getDoc(userDocRef);
  //     const estadisticasActuales = estadisticasSnapshot.exists() ? estadisticasSnapshot.data() : {};
  //
  //     // Comparar y actualizar solo si el nuevo valor es mejor
  //     const estadisticasActualizadas = {
  //       mayorDistancia: Math.max(nuevasEstadisticas.mayorDistancia, estadisticasActuales['mayorDistancia'] || 0),
  //       menorTiempo: estadisticasActuales['menorTiempo']
  //         ? Math.min(nuevasEstadisticas.menorTiempo, estadisticasActuales['menorTiempo'])
  //         : nuevasEstadisticas.menorTiempo,
  //       mayorDuracion: Math.max(nuevasEstadisticas.mayorDuracion, estadisticasActuales['mayorDuracion'] || 0),
  //     };
  //
  //
  //     await setDoc(userDocRef, estadisticasActualizadas, {merge: true});
  //     console.log("Estadísticas actualizadas correctamente");
  //   } catch (error) {
  //     console.error("Error al actualizar estadísticas:", error);
  //   }
  // }

  async actualizarEstadisticas(userId: string, nuevasEstadisticas: any): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}/estadisticas/data`);

      // Obtener los valores actuales
      const estadisticasSnapshot = await getDoc(userDocRef);
      const estadisticasActuales = estadisticasSnapshot.exists() ? estadisticasSnapshot.data() : {};

      if (nuevasEstadisticas.mayorDistancia > estadisticasActuales['mayorDistancia']) {
        this.nuevoRecordDistanciaS.next(true);
      } else {
        this.nuevoRecordDistanciaS.next(false);
      }
      if (nuevasEstadisticas.menorTiempo < estadisticasActuales['menorTiempo']) {
        this.nuevoRecordTiempoS.next(true);
      } else {
        this.nuevoRecordTiempoS.next(false);
      }
      if (nuevasEstadisticas.mayorDuracion > estadisticasActuales['mayorDuracion']) {
        this.nuevoRecordDuracionS.next(true);
      } else {
        this.nuevoRecordDuracionS.next(false);
      }

      // Comparar y actualizar solo si el nuevo valor es mejor
      const estadisticasActualizadas = {
        mayorDistancia: Math.max(nuevasEstadisticas.mayorDistancia, estadisticasActuales['mayorDistancia'] || 0),
        menorTiempo: estadisticasActuales['menorTiempo']
          ? Math.min(nuevasEstadisticas.menorTiempo, estadisticasActuales['menorTiempo'])
          : nuevasEstadisticas.menorTiempo,
        mayorDuracion: Math.max(nuevasEstadisticas.mayorDuracion, estadisticasActuales['mayorDuracion'] || 0),
      };

      await setDoc(userDocRef, estadisticasActualizadas, {merge: true});
      console.log("Estadísticas actualizadas correctamente");
    } catch (error) {
      console.error("Error al actualizar estadísticas:", error);
    }
  }

  async obtenerEstadisticas(userId: string): Promise<any> {
    const userDocRef = doc(this.firestore, `users/${userId}/estadisticas/data`);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  }
}
