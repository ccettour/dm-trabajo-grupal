import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  IonBackButton, IonButtons,
  IonCard, IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader, IonIcon,
  IonTitle,
  IonToolbar, NavController
} from '@ionic/angular/standalone';
import {EstadisticasService} from "../../services/estadisticas/estadisticas.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {addIcons} from "ionicons";
import {arrowBackOutline} from "ionicons/icons";
import {CalculosService} from "../../services/calculos/calculos.service";

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonIcon]
})
export class EstadisticasPage implements OnInit {

  userId: string | undefined;
  mayorDistancia: number = 0;
  menorTiempoProm: number = 0;
  mayorDuracion: number = 0;
  nuevoRecordDistancia: boolean = false;
  nuevoRecordTiempo: boolean = false;
  nuevoRecordDuracion: boolean = false;


  constructor(
    private estadisticaService: EstadisticasService,
    private authService: AuthService,
    protected calculo: CalculosService,
    private router: Router,
    private navCtrl: NavController,
  ) {
    addIcons({arrowBackOutline});
  }

  ngOnInit(): void {
    this.obtenerEstadisticas();
    this.estadisticaService.nuevoRecordDistancia$.subscribe((isRecord) => {
      this.nuevoRecordDistancia = isRecord;
    });
    this.estadisticaService.nuevoRecordTiempo$.subscribe((isRecord) => {
      this.nuevoRecordTiempo = isRecord;
    });
    this.estadisticaService.nuevoRecordDuracion$.subscribe((isRecord) => {
      this.nuevoRecordDuracion = isRecord;
    });
  }

  async obtenerEstadisticas() {
    this.authService.getDatosUsuario().subscribe(async (usuario) => {
      if (usuario) {
        this.userId = usuario.uid;

        // Se cargan los datos desde Firestore
        const userStats = await this.estadisticaService.obtenerEstadisticas(this.userId);

        if (userStats) {
          this.mayorDistancia = userStats.mayorDistancia;
          this.mayorDuracion = userStats.mayorDuracion;
          this.menorTiempoProm = userStats.menorTiempo;
        }
      } else {
        console.error('Usuario no autenticado');
        await this.router.navigate(['/login']);
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}
