import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {IonButton, IonButtons, IonContent, IonHeader, IonImg, IonInput, IonInputPasswordToggle,
  IonRouterLink, IonTitle, IonToolbar, ToastController} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonRouterLink, RouterLink,
    ReactiveFormsModule, IonInput, IonInputPasswordToggle, IonButtons, IonImg]
})
export class LoginPage implements OnInit {

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    pass: new FormControl('', [Validators.required]),
  });

  constructor(private router: Router, private toastController: ToastController) { }

  ngOnInit() {
    console.log('ngOnInit');
  }

  user={
    "email": "admin@mail.com",
    "pass": "admin123",
  }

  onSubmit(){
    console.log(this.loginForm.value);
    const email = this.loginForm.get('email')?.value;
    const pass = this.loginForm.get('pass')?.value;

    if(email.toLowerCase()!==this.user.email){
      this.errorMessage("El email no está registrado");
    } else if(email.toLowerCase()===this.user.email && pass===this.user.pass){
      this.router.navigate(['/home'])
    } else {
      this.errorMessage("Email y/o clave incorrecto");
    }
  }

  async errorMessage(contenido: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await mensaje.present();
  }
}
