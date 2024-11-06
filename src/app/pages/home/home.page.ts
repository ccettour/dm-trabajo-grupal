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
import {GoogleMap, Polyline} from "@capacitor/google-maps";
import {environment} from "../../../environments/environment";
import {Geolocation, Position} from "@capacitor/geolocation";

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
  estaGrabando: boolean = false;
  path: any[] = [];
  distanciaTotal: number = 0;
  watchId!: string;

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

  async iniciarRecorrido() {
    if (this.estaGrabando) return;
    
    this.estaGrabando = true;
    this.path = []; // Resetea el recorrido
    this.distanciaTotal = 0;

    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (posicion, err) => {
        if (posicion){
          this.actualizarPosicion(posicion);
          this.addPolylines()
        } 

      }
    );
  }

async pararRecorrido() {
    if (!this.estaGrabando) return;
    
    this.estaGrabando = false;
    Geolocation.clearWatch({ id: this.watchId });
    
    await this.toastMessage(`Distancia total: ${this.distanciaTotal.toFixed(2)} km`, 'success');
  }
  
  async actualizarPosicion(posicion: Position) {
    const { latitude, longitude } = posicion.coords;
    const newPoint = { lat: latitude, lng: longitude };
    
    // Añade el nuevo punto a la ruta
    if (this.path.length > 0) {
        const lastPoint = this.path[this.path.length - 1];
        this.distanciaTotal += this.calcularDistancia(lastPoint, newPoint);
    }
    this.path.push(newPoint);

}
async addPolylines(){
  const lineas: Polyline[] = [{
    path:this.path,
    strokeColor: '#FF0000',
    strokeWeight: 5,
    geodesic: true,
  }];
  const resultado = await this.map.addPolylines(lineas);
}

  // Calcula la distancia entre dos puntos usando la fórmula Haversine
  calcularDistancia(start: { lat: number; lng: number; }, end: { lat: any; lng: any; }) {
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(end.lat - start.lat);
    const dLon = this.deg2rad(end.lng - start.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(start.lat)) * Math.cos(this.deg2rad(end.lat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
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
