import { Injectable } from '@angular/core';
import {FirebaseAuthentication} from "@capacitor-firebase/authentication";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuarioLogueado:any;

  constructor() { }

  async registroConEmail(params: { email: string, pass: string }): Promise<any>  {
    const res = await FirebaseAuthentication.createUserWithEmailAndPassword({email: params.email, password: params.pass});
    return res.user;
  }

  async inicioConEmailYPass(params: { email: string, pass: string }): Promise<any> {
    const res = await FirebaseAuthentication.signInWithEmailAndPassword({email: params.email, password: params.pass});
    return res.user;
  }

  async datosUsuario(){
    const usuario = await FirebaseAuthentication.getCurrentUser();
    if(usuario){
      this.usuarioLogueado = {
        email: usuario.user?.email,
        uid: usuario.user?.uid
      };
    }
    console.log(this.usuarioLogueado);
  }

  async cerrarSesion(): Promise<void>{
    await FirebaseAuthentication.signOut();
  }
}
