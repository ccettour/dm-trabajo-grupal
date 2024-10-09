import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput,
  IonInputPasswordToggle, IonLabel, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import {Router} from "@angular/router";
import {addIcons} from "ionicons";
import {pencil} from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons,
    IonButton, IonInput, IonInputPasswordToggle, ReactiveFormsModule, IonAvatar, IonLabel, IonIcon]
})
export class PerfilPage implements OnInit {

  constructor(private router: Router, private toastController: ToastController) {
    addIcons({pencil});
  }
  avatarUrl: string | ArrayBuffer | null | undefined = '/assets/avatar.jpg';

  user={
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "admin@mail.com",
    "avatar": "/assets/avatar.jpg"
  }

  profileForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    avatar: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.profileForm.setValue({
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      email: this.user.email,
      avatar: this.user.avatar,
    })
  }

  onSubmit(){
    this.errorMessage("Perfil actualizado","success");
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.avatarUrl = e.target?.result;
      };

      reader.readAsDataURL(file);
    }
  }

  async errorMessage(contenido: string, color: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    mensaje.present();
  }
}
