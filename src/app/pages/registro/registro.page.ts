import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonInputPasswordToggle, IonLoading,
  IonRouterLink, IonTitle, IonToolbar, ToastController
} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import { PerfilService } from 'src/app/services/perfil/perfil.service';
import { LoadingController } from '@ionic/angular';

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
    private authService: AuthService,
    private perfilService: PerfilService,
    private loadingController: LoadingController
    ) {
  }

  registroForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    pass: new FormControl('', [Validators.required]),
    repeatPass: new FormControl('', [Validators.required])
  });

  async onSubmit() {
    const loading = await this.loadingController.create({
      message: 'Registrando...',
      spinner: 'crescent',
    });
    await loading.present();

    const pass = this.registroForm.get('pass')?.value;
    const repeatPass = this.registroForm.get('repeatPass')?.value;

    const valores = this.registroForm.value;

    if (pass !== repeatPass) {
      await this.errorMessage("Las claves no coinciden", "danger");
      await loading.dismiss();
    } else {
      try{
        const usuario = await this.authService.registroConEmail(valores);
        await this.errorMessage("Usuario creado", "success");
        if(usuario){
          const userId=usuario?.uid
          const datos = {
            nombre: this.registroForm.get('nombre')?.value,
            email: this.registroForm.get('email')?.value,
            avatarUrl: '/assets/avatar.jpg'
          };
          await this.perfilService.actualizarPerfil(userId, datos);
        }

        await this.router.navigate(['/login']);
      } catch (error:any) {
        if (error.code === 'auth/email-already-in-use') {
          await this.errorMessage("El mail ya existe. Intente con otro.", "danger");
        } else if(error.code === 'auth/weak-password'){
          await this.errorMessage("La contraseña no es segura. Intente con otra.", "danger");
        } else{
          await this.errorMessage("Error al crear la cuenta.", "danger")
        }
      } finally {
        await loading.dismiss();
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
