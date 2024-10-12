import { Component, OnInit } from '@angular/core';
import { CommonModule,NgOptimizedImage } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput,
  IonInputPasswordToggle, IonLabel, IonTitle, IonToolbar, ToastController,IonImg, ActionSheetController } from '@ionic/angular/standalone';
import {Router} from "@angular/router";
import {addIcons} from "ionicons";
<<<<<<< Updated upstream:src/app/pages/perfil/perfil.page.ts
import {pencil} from 'ionicons/icons';
import {AuthService} from "../../services/auth/auth.service";
=======
import {add, camera, cameraOutline, image, imageOutline, pencil} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
>>>>>>> Stashed changes:src/app/perfil/perfil.page.ts

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons,
    IonButton, IonInput, IonInputPasswordToggle, ReactiveFormsModule, IonAvatar, IonLabel, IonIcon,IonImg,NgOptimizedImage]
})
export class PerfilPage implements OnInit {

<<<<<<< Updated upstream:src/app/pages/perfil/perfil.page.ts
  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService,
  ) {
    addIcons({pencil});
=======
  images: string[] = []

  constructor(private router: Router, private toastController: ToastController,private actionSheetController: ActionSheetController) {
    addIcons({pencil,cameraOutline,imageOutline,add,camera,image});
>>>>>>> Stashed changes:src/app/perfil/perfil.page.ts
  }

  avatarUrl: string | ArrayBuffer | null | undefined = '/assets/avatar.jpg';

  profileForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    avatar: new FormControl(''),
  });

  async ngOnInit() {
    await this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    await this.authService.datosUsuario();
    const usuario = this.authService.usuarioLogueado;

    if (usuario) {
      this.profileForm.patchValue({
        email: usuario.email,
      });
    }
  }

  async onSubmit(){

    await this.errorMessage("Perfil actualizado","success");
    await this.router.navigate(['/home']);
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
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
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
}
async openCameraRoll() {
  try {
    const images = await Camera.pickImages({
      quality: 100,
      limit: 1,
    });
    if (images.photos.length > 0){
      this.avatarUrl = images.photos[0].webPath;
    }
  } catch (e) {
    console.log(e)
  }

}
  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (image?.webPath) {
        this.avatarUrl = image.webPath;
      }
      console.log(this.images)
    } catch (e) {
      console.log(e)
    }
  }

  /*onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.avatarUrl = e.target?.result;
      };

      reader.readAsDataURL(file);
    }
  }*/

  async errorMessage(contenido: string, color: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await mensaje.present();
  }
}
