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
import { addIcons } from 'ionicons';
import { playOutline, stopOutline } from 'ionicons/icons';
import { PerfilService } from 'src/app/services/perfil/perfil.service';
import { User } from 'firebase/auth';

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
  map: GoogleMap|null;
  estaGrabando: boolean = false;
  path: any[] = [];
  lineas: Polyline [] = [];
  distanciaTotal: number = 0;
  watchId!: string;
  peso:number = 0;
  estatura:number = 0;
  duracionRecorrido: number = 0;
  caloriasQuemadas: number = 0;
  inicioRecorrido: Date|undefined;

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private toastController: ToastController,
    private perfilService: PerfilService,
  ) {
    addIcons({playOutline,stopOutline});
  }

  async obtenerParametros(){
    this.authService.getDatosUsuario().subscribe(async (usuario:User | null) => {
      if (usuario){
        const perfil = await this.perfilService.obtenerDatosPerfil(usuario.uid);
        if(perfil){
          this.peso = perfil.peso;
          this.estatura = perfil.estatura;
        }
      }
    })
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(0, () => {
      });
    });

    this.initMaps();
    this.obtenerParametros();
  }

  /*MAPS*/

  async destruirMapa() {
    if (this.map) {
      await this.map.destroy();
      this.map = null; 
    }
  }
  async initMaps() {
    const tienePermisos = await this.evaluarPermisos();
    if (!tienePermisos) {
      await this.toastMessage("No tiene permisos para mostrar el mapa", "danger");
      return;
    }
    if (!this.mapRef) {
      await this.toastMessage("Error al cargar el mapa", "danger");
      return;
    }
  
    // Obtener ubicación actual
    const ubicacion = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    const { coords: { latitude, longitude } } = ubicacion;
  
    // Crear un nuevo mapa
    this.map = await GoogleMap.create({
      id: 'map',
      element: this.mapRef.nativeElement,
      apiKey: environment.googleMapsKey,
      config: {
        center: { lat: latitude, lng: longitude },
        zoom: 16,
      },
    });
  
    // Habilitar la localización del usuario
    await this.map.enableCurrentLocation(true);
  }
    
  async iniciarRecorrido() {
    if (this.estaGrabando) return;
  
    this.estaGrabando = true;
  
    // Limpiar el recorrido anterior
    await this.destruirMapa();
    await this.initMaps();
  
    // Reseteo de valores
    this.path = [];
    this.distanciaTotal = 0;
    this.caloriasQuemadas = 0;
    this.inicioRecorrido = new Date();
  
    await this.toastMessage("Recorrido iniciado", "success");
  
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (posicion, err) => {
        if (posicion) {
          this.actualizarPosicion(posicion);
          this.addPolylines();
        }
      }
    );
  }
  

async pararRecorrido() {
    if (!this.estaGrabando) return;
    
    this.estaGrabando = false;
    Geolocation.clearWatch({ id: this.watchId });

    if( this.inicioRecorrido){
      const finRecorrido = new Date();
      this.duracionRecorrido = (finRecorrido.getTime() - this.inicioRecorrido.getTime()) / 1000 /60 ;
    }
    this.calcularCalorias();
    await this.toastMessage("Recorrido Finalizado","success" ); 
  }
  
  async calcularCalorias(){
    const calorias = 0.029*(this.peso* 2.2)* this.duracionRecorrido;
  this.caloriasQuemadas = calorias;
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
  this.lineas = [{
    path:this.path,
    strokeColor: '#009B77',
    strokeWeight: 5,
    geodesic: true,
  }];
  if (this.map){
    const resultado = await this.map.addPolylines(this.lineas);
  }
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

  async toastMessage(contenido: string, color: "success" | "danger") {
    const mensaje = await this.toastController.create({
      message: contenido,
      color: color,
      position: 'bottom',
      buttons: [{role: 'cancel', text: 'OK'}]
    });
    await mensaje.present();
  }
}
