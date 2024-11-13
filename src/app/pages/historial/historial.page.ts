import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton, IonButton,
  IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonContent,
  IonHeader, IonIcon, IonImg,
  IonItem, IonLabel, IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {HistorialService} from "../../services/historial/historial.service";
import {AuthService} from "../../services/auth/auth.service";
import {addIcons} from "ionicons";
import {trashOutline} from "ionicons/icons";
import {Dialog} from "@capacitor/dialog";
import {CalculosService} from "../../services/calculos/calculos.service";

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, IonItem, IonList, IonLabel, IonImg, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonIcon]
})
export class HistorialPage implements OnInit {
  historialRecorridos: any[] = [];

  constructor(
    private historialService: HistorialService,
    private authService: AuthService,
    protected calculo: CalculosService,
  ) {
    addIcons({trashOutline});
  }

  ngOnInit() {
    this.authService.getDatosUsuario().subscribe((user) => {
      if (user) {
        this.cargarHistorial(user.uid);
      }
    });
  }

  cargarHistorial(userId: string) {
    this.historialService.obtenerHistorialRecorridos(userId).subscribe((recorridos) => {
      this.historialRecorridos = recorridos;
    });
  }

  eliminarRecorrido(recorridoId: string) {
    this.authService.getDatosUsuario().subscribe((user) => {
      if (user) {
        this.historialService.eliminarRecorrido(user.uid, recorridoId).then(() => {
          console.log("Recorrido eliminado exitosamente");
          // Filtra el recorrido eliminado de la lista local para actualizar la vista sin recargar
          this.historialRecorridos = this.historialRecorridos.filter(recorrido => recorrido.id !== recorridoId);
        }).catch((error) => {
          console.error("Error al eliminar el recorrido:", error);
        });
      }
    });
  }

  confirmarBorrado = async (recorridoId: string) => {
    const {value} = await Dialog.confirm({
      title: 'Eliminar recorrido',
      message: 'Confirme que desea eliminar el recorrido',
      okButtonTitle: 'Aceptar',
      cancelButtonTitle: 'Cancelar'
    })
    if (value) {
      this.eliminarRecorrido(recorridoId);
    }
  };

}
