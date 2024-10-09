import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonInputPasswordToggle,
  IonRouterLink, IonTitle, IonToolbar, ToastController
} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons,
    IonButton, IonInput, IonInputPasswordToggle, IonRouterLink, ReactiveFormsModule, RouterLink]
})
export class RegistroPage implements OnInit {

  constructor(private router: Router, private toastController: ToastController) {
  }

  registroForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    pass: new FormControl('', [Validators.required]),
    repeatPass: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    console.log('ngOnInit');
  }

  onSubmit() {
    const email = this.registroForm.get('email')?.value;
    const pass = this.registroForm.get('pass')?.value;
    const repeatPass = this.registroForm.get('repeatPass')?.value;

    if (email.toLowerCase() === "admin@mail.com") {
      this.errorMessage("Ya existe una cuenta con ese mail")
    } else if (pass !== repeatPass) {
      this.errorMessage("Las claves no coinciden")
    } else {
      console.log(this.registroForm.value);
      this.router.navigate(['/login'])
    }
  }

  async errorMessage(contenido: string) {
    const mensaje = await this.toastController.create({
      message: contenido,
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    mensaje.present();
  }
}
