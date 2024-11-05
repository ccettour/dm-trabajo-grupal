import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonRouterLink,
  IonMenu,
  IonMenuButton,
  Platform,
  IonButtons,
  IonImg,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonFooter,
  ToastController
} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import {GoogleMap} from "@capacitor/google-maps";
import {environment} from "../../../environments/environment";
import {Geolocation} from "@capacitor/geolocation";

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonRouterLink, RouterLink, IonMenu, IonMenuButton,
    IonButtons, IonImg, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonFooter],
})
export class HomePage{
  private backButtonSubscription: any;

// @ts-ignore
  @ViewChild('map') mapRef: ElementRef<HTMLElement>;
  // @ts-ignore
  map: GoogleMap;

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private toastController: ToastController,
  ) {
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(0, () => {
      });
    });

    this.initMaps();
  }

  /*MAPS*/

  async initMaps(){
    const tienePermisos = await this.evaluarPermisos();
    if(!tienePermisos){
      await this.toastMessage("No tiene permisos para mostrar el mapa","danger");
      return;
    }
    if(!this.mapRef){
      await this.toastMessage("Error al cargar el mapa", "danger");
      return;
    }
    const ubicacion = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
    const {coords: {latitude, longitude}} = ubicacion;
    this.map = await GoogleMap.create({
      id: 'map',
      element: this.mapRef.nativeElement,
      apiKey: environment.googleMapsKey,
      config: {
        center: {
          lat: latitude,
          lng: longitude,
        },
        zoom: 16,
      }
    });

    await this.map.enableCurrentLocation(true);
  }

  async evaluarPermisos(){
    const permisos = await Geolocation.checkPermissions();
    return permisos.location === 'granted' && permisos.coarseLocation === 'granted';
  }

  /*FIN MAPS*/

  ionViewDidLeave() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  async salir(): Promise<void> {
    await this.authService.cerrarSesion();
    await this.router.navigate(['/login']);
  }

  async toastMessage(contenido: string, color: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      color: color,
      position: 'bottom',
      buttons: [{role: 'cancel', text: 'OK'}]
    });
    await mensaje.present();
  }
}
