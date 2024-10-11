import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {IonButton, IonButtons, IonContent, IonHeader, IonImg, IonInput, IonInputPasswordToggle,
  IonRouterLink, IonTitle, IonToolbar, ToastController} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonRouterLink, RouterLink,
    ReactiveFormsModule, IonInput, IonInputPasswordToggle, IonButtons, IonImg]
})
export class LoginPage{

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    pass: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService
  ) { }

  async onSubmit(){
    const valores = this.loginForm.value;

    try{
      await this.authService.inicioConEmailYPass(valores);
      await this.router.navigate(['/home']);
    }catch(error){
      await this.errorMessage("Email y/o clave incorrecto");
    }
  }

  async errorMessage(contenido: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await mensaje.present();
  }
}
