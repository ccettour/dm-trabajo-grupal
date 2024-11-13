import {Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild} from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonRouterLink, IonMenu, IonMenuButton,
  Platform, IonButtons, IonImg, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonFooter, ToastController, IonFab, IonFabButton, IonIcon
} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import {GoogleMap, Polyline} from "@capacitor/google-maps";
import {environment} from "../../../environments/environment";
import {Geolocation, Position} from "@capacitor/geolocation";
import {addIcons} from 'ionicons';
import {playOutline, shareSocialOutline, stopOutline} from 'ionicons/icons';
import {PerfilService} from 'src/app/services/perfil/perfil.service';
import {User} from 'firebase/auth';
import {HistorialService} from "../../services/historial/historial.service";
import {user} from "@angular/fire/auth";
import html2canvas from "html2canvas";
import axios from "axios";
import {EstadisticasService} from "../../services/estadisticas/estadisticas.service";
import { Dialog } from '@capacitor/dialog';
import { Screenshot } from 'capacitor-screenshot';
import {Share} from "@capacitor/share";
import {Camera} from "@capacitor/camera";
import {Directory, Filesystem, WriteFileResult} from "@capacitor/filesystem";
import {CalculosService} from "../../services/calculos/calculos.service";

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonRouterLink, RouterLink, IonMenu, IonMenuButton,
    IonButtons, IonImg, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonFooter, IonFab, IonFabButton, IonIcon],
})
export class HomePage {
  private backButtonSubscription: any;

// @ts-ignore
  @ViewChild('map', { static: false }) mapRef: ElementRef<HTMLElement>;
  // @ts-ignore
  map: GoogleMap | null;
  estaGrabando: boolean = false;
  path: any[] = [];
  lineas: Polyline [] = [];
  distanciaTotal: number = 0;
  watchId!: string;
  peso: number = 0;
  estatura: number = 0;
  duracionRecorrido: number = 0;
  caloriasQuemadas: number = 0;
  kmxh: number= 0;
  inicioRecorrido: Date | undefined;
  puedeCompartir: boolean = true;

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private toastController: ToastController,
    private perfilService: PerfilService,
    private historialService: HistorialService,
    private estadisticasService: EstadisticasService,
    protected calculo: CalculosService,
  ) {
    addIcons({playOutline, stopOutline, shareSocialOutline});
  }

  async obtenerParametros() {
    this.authService.getDatosUsuario().subscribe(async (usuario: User | null) => {
      if (usuario) {
        const perfil = await this.perfilService.obtenerDatosPerfil(usuario.uid);
        if (perfil) {
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
      await Geolocation.requestPermissions();
      const repetirPermisos = await this.evaluarPermisos();
      if (!repetirPermisos) {
        await this.toastMessageBtn("No tiene permisos para mostrar el mapa", "danger");
      }
    }
    if (!this.mapRef) {
      await this.toastMessageBtn("Error al cargar el mapa", "danger");
      return;
    }

    // Obtener ubicación actual
    const ubicacion = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
    const {coords: {latitude, longitude}} = ubicacion;

    // Crear un nuevo mapa
    this.map = await GoogleMap.create({
      id: 'map',
      element: this.mapRef.nativeElement,
      apiKey: environment.googleMapsKey,
      config: {
        center: {lat: latitude, lng: longitude},
        zoom: 16,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "landscape.man_made",
            elementType: "geometry.fill",
            stylers: [{ visibility: "off" }]
          }
        ]
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

    await this.agregarMarcador();

    // Reseteo de valores
    this.path = [];
    this.distanciaTotal = 0;
    this.caloriasQuemadas = 0;
    this.inicioRecorrido = new Date();

    await this.toastMessage("Recorrido iniciado", "success");

    this.watchId = await Geolocation.watchPosition(
      {enableHighAccuracy: true},
      (posicion, err) => {
        if (posicion) {
          this.actualizarPosicion(posicion);
          this.addPolylines();
        }
      }
    );
  }

  async agregarMarcador(){
    const posicion = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    const { latitude, longitude } = posicion.coords;
    if(this.map){
      await this.map.addMarker({
        coordinate: {
          lat: latitude,
          lng: longitude
        }
      });
    }
  }

  async pararRecorrido() {
    if (!this.estaGrabando) return;

    this.estaGrabando = false;
    await this.agregarMarcador();

    Geolocation.clearWatch({id: this.watchId});

    if (this.inicioRecorrido) {
      const finRecorrido = new Date();
      this.duracionRecorrido = (finRecorrido.getTime() - this.inicioRecorrido.getTime()) / 1000;
    }

    this.kmxh = this.distanciaTotal/(this.duracionRecorrido/60);

    this.caloriasQuemadas = await this.calculo.calcularCalorias(this.kmxh, this.duracionRecorrido, this.peso);
    if(this.peso===0){
      await this.toastMessageBtn("Cargue su peso en el perfil para ver las calorías quemadas", "danger");
    }

    await this.toastMessage("Recorrido Finalizado", "success");

    const formData: FormData|null = await this.capturaMapa();
    if(!formData){
      console.error('Error al capturar la imagen del mapa');
      return;
    }

    try {
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`,
        formData
      );

      const mapaUrl = cloudinaryResponse.data.secure_url;
      console.log("Url de la imagen: ", mapaUrl);

      // Guardar datos en historial
      this.authService.getDatosUsuario().subscribe(async (usuario: User | null) => {
        if (usuario) {
          const userId = usuario.uid;
          if (userId) {
            await this.historialService.guardarRecorrido(userId, {
              distanciaTotal: this.distanciaTotal,
              kmxh: this.kmxh,
              duracion: this.duracionRecorrido,
              mapa: mapaUrl, // Guarda la URL de la imagen en Cloudinary
            });

            await this.historialService.ultimos5(userId);

            await this.estadisticasService.actualizarEstadisticas(userId, {
              mayorDistancia: this.distanciaTotal,
              menorTiempo: ((this.duracionRecorrido/60)/this.distanciaTotal),
              mayorDuracion: this.duracionRecorrido,
            })
          }
        }
      });
    } catch (error) {
      console.error('Error al subir la imagen a Cloudinary:', error);
    }
  }

  async actualizarPosicion(posicion: Position) {
    const {latitude, longitude} = posicion.coords;
    const newPoint = {lat: latitude, lng: longitude};

    // Añade el nuevo punto a la ruta
    if (this.path.length > 0) {
      const lastPoint = this.path[this.path.length - 1];
      this.distanciaTotal += this.calculo.calcularDistancia(lastPoint, newPoint);
    }
    this.path.push(newPoint);
  }

  async addPolylines() {
    this.lineas = [{
      path: this.path,
      strokeColor: '#009B77',
      strokeWeight: 5,
      geodesic: true,
      zIndex:1000,
    }];
    if (this.map) {
      const resultado = await this.map.addPolylines(this.lineas);
    }
  }

  async evaluarPermisos() {
    const permisos = await Geolocation.checkPermissions();
    return permisos.location === 'granted' && permisos.coarseLocation === 'granted';
  }

  async capturaMapa(): Promise<FormData | null> {
    try {
      // Asegúrate de tener una referencia al elemento del mapa en el DOM
      const mapElement = document.getElementById('map'); // Ajusta el ID según el tuyo
      if (!this.mapRef) {
        console.error('No se encontró el elemento del mapa');
        return null;
      }
      const canvas = await html2canvas(this.mapRef.nativeElement);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blobResult) => resolve(blobResult), 'image/jpeg');
      });

      if (!blob) {
        console.error('No se pudo generar la imagen del mapa');
        return null;
      }
        const formData = new FormData();
        formData.append('file', blob, "mapa.jpg");
        formData.append('upload_preset', environment.cloudinary.uploadPreset);

        return formData;
      } catch (error: any) {
        console.error('Error al capturar el mapa:', error);
        await this.toastMessage(`Error al capturar el mapa`, 'danger');
        return null;
      }
    }

  /*FIN MAPS*/

  ionViewDidLeave() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  async compartir() {
    if (!this.puedeCompartir) {
      return;
    }

    try {
      const ret:{base64:string} = await Screenshot.take();
      if (ret.base64) {
        const archivo = `screenshot_${new Date().getTime()}.png`;
        const datosArchivo: WriteFileResult = await Filesystem.writeFile({
          path: archivo,
          data: ret.base64,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: 'Mis estadísticas',
          text: '¡Mira las estadísticas de mi última caminata!',
          files: [datosArchivo.uri],
        });
      }
    } catch (error) {
      console.error('Error al compartir la captura:', error);
    }
  }

  confirmarCierre = async () => {
    const {value} = await Dialog.confirm({
      title: 'Cerrar sesión',
      message: 'Confirme que desea cerrar sesión',
      okButtonTitle: 'Aceptar',
      cancelButtonTitle: 'Cancelar'
    })
    if (value) {
      await this.salir();
    }
  };

  async salir(): Promise<void> {
    await this.authService.cerrarSesion();
    await this.router.navigate(['/login']);
  }

  async toastMessageBtn(contenido: string, color: "success" | "danger") {
    const mensaje = await this.toastController.create({
      message: contenido,
      color: color,
      position: 'bottom',
      buttons: [{role: 'cancel', text: 'OK'}]
    });
    await mensaje.present();
  }

  async toastMessage(contenido: string, color: "success"|"danger") {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    await mensaje.present();
  }
}
