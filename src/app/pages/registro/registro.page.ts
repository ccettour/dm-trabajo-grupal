import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonInputPasswordToggle, IonLoading,
  IonRouterLink, IonTitle, IonToolbar, ToastController
} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons,
    IonButton, IonInput, IonInputPasswordToggle, IonRouterLink, ReactiveFormsModule, RouterLink, IonLoading]
})
export class RegistroPage {

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService
    ) {
  }

  loading = false;

  registroForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    pass: new FormControl('', [Validators.required]),
    repeatPass: new FormControl('', [Validators.required])
  });

  async onSubmit() {
    this.loading = true;

    const pass = this.registroForm.get('pass')?.value;
    const repeatPass = this.registroForm.get('repeatPass')?.value

    const valores = this.registroForm.value;

    if (pass !== repeatPass) {
      this.loading = false;
      await this.errorMessage("Las claves no coinciden", "danger")
    } else {
      try{
        const usuario = await this.authService.registroConEmail(valores);
        this.loading = false;
        await this.errorMessage("Usuario creado", "success");
        await this.router.navigate(['/login'])
      } catch (error) {
        this.loading = false;
        await this.errorMessage("Error al crear el usuario", "danger")
      }
    }
  }

  async errorMessage(contenido: string, color: 'danger' | 'success') {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await mensaje.present();
  }
}
