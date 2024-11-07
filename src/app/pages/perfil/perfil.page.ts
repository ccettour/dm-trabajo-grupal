import { Component, OnInit } from '@angular/core';
import { CommonModule,NgOptimizedImage } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput,
  IonInputPasswordToggle, IonLabel, IonTitle, IonToolbar, ToastController, IonImg, ActionSheetController, IonLoading
} from '@ionic/angular/standalone';
import {Router} from "@angular/router";
import {addIcons} from "ionicons";
import {add, camera, cameraOutline, closeOutline, image, imageOutline, pencil} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PerfilService } from 'src/app/services/perfil/perfil.service'; // Servicio para interactuar con Firestore
import { LoadingController } from '@ionic/angular';
import axios from "axios";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons,
    IonButton, IonInput, IonInputPasswordToggle, ReactiveFormsModule, IonAvatar, IonLabel, IonIcon, IonImg, NgOptimizedImage, IonLoading]
})
export class PerfilPage implements OnInit {
  images: string[] = []

  avatarUrl: string | ArrayBuffer | null | undefined = '/assets/avatar.jpg';

  profileForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    estatura: new FormControl(''),
    peso: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    avatar: new FormControl('', [Validators.required]),
  });

  userId: string | undefined;
  imc: string = "Ingresa peso y estatura para obtener este dato";

  constructor(
    private router: Router,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private authService:AuthService,
    private perfilService: PerfilService,
    private loadingController: LoadingController
  ) {
    addIcons({pencil,cameraOutline,imageOutline,add,camera,image, closeOutline});
  }

  async ngOnInit() {
    await this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    this.authService.getDatosUsuario().subscribe(async (usuario) => {
      if (usuario) {
        this.userId = usuario.uid;

        // Se cargan los datos desde Firestore
        const userProfile = await this.perfilService.obtenerDatosPerfil(this.userId);

         if (userProfile) {
        //   //IMC
        //   const estatura:number= (userProfile.estatura)/100;
        //   const peso: number= userProfile.peso;
        //
        //   if(estatura > 0 && peso > 0){
        //     this.imc = peso / (estatura * estatura);
        //   }

          this.profileForm.patchValue({
            nombre: userProfile.nombre,
            // estatura: estatura*100,
            // peso: peso,
            estatura: userProfile.estatura,
            peso: userProfile.peso,
            email: userProfile.email,
            avatar: userProfile.avatarUrl
          });
          this.avatarUrl = userProfile.avatarUrl || this.avatarUrl;
        }
      } else {
        console.error('Usuario no autenticado');
        await this.router.navigate(['/login']);
      }
    });
  }

  async onSubmit() {
    const loading: HTMLIonLoadingElement = await this.loadingController.create({
      message: 'Actualizando...',
      spinner: 'crescent',
    });
    await loading.present();

    if (this.profileForm.valid && this.userId) {
      const profileData = {
        nombre: this.profileForm.value.nombre,
        estatura: this.profileForm.value.estatura,
        peso: this.profileForm.value.peso,
        avatarUrl: this.avatarUrl
      };

        //IMC
        const estatura:number= (profileData.estatura.valueOf())/100;
        const peso: number= profileData.peso.valueOf();

        if(estatura > 0 && peso > 0){
          const calculoImc: number = peso / (estatura * estatura);
          this.imc = calculoImc.toFixed(2);
        } else {
          this.imc = "Ingresa peso y estatura para obtener este dato";
        }

      try {
        await this.perfilService.actualizarPerfil(this.userId, profileData);
        await this.toastMessage("Perfil actualizado", "success");
        await this.router.navigate(['/home']);
      } catch (err) {
        console.error('Error al actualizar perfil', err);
        await this.toastMessage('Error al actualizar perfil', 'danger');
      } finally {
        await loading.dismiss();
      }
    } else {
      await loading.dismiss();
      await this.toastMessage('Formulario inválido o usuario no autenticado', 'warning');
    }
  }

  async presentActionSheet() {
    const actionSheet: HTMLIonActionSheetElement = await this.actionSheetController.create({
      header: 'Selecciona una opción',
      buttons: [
        {
          text: 'Tomar una foto',
          icon: camera,
          cssClass: 'action-sheet-button',
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: 'Seleccionar de la galería',
          icon: image,
          cssClass: 'action-sheet-button',
          handler: () => {
            this.openCameraRoll();
          }
        },
        {
          text: 'Cancelar',
          icon: closeOutline,
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
}

  async openCameraRoll() {
    try {
      const images = await Camera.pickImages({ quality: 100, limit: 1 });
      if (images.photos.length > 0) {
        await this.subirFotoACloudinary(images.photos[0].webPath!);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (image.webPath) {
        await this.subirFotoACloudinary(image.webPath);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async subirFotoACloudinary(imageUri: string) {
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
    });
    await loading.present();

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const formData = new FormData();

      formData.append('file', blob, 'profile-image.jpg');
      formData.append('upload_preset', environment.cloudinary.uploadPreset);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`,
        formData
      );

      this.avatarUrl = cloudinaryResponse.data.secure_url;

      // Guarda el enlace en el usuario en Firestore:
      if (this.userId) {
        await this.perfilService.actualizarPerfil(this.userId, { avatarUrl: this.avatarUrl });
        await this.toastMessage("Imagen subida y perfil actualizado", "success");
      }
    } catch (error: any) {
      await this.toastMessage(`Error al subir imagen`, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async toastMessage(contenido: string, color: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await mensaje.present();
  }
}
