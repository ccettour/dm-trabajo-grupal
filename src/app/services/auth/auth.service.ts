import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioLogueadoSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public usuarioLogueado$: Observable<User | null> = this.usuarioLogueadoSubject.asObservable();

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.usuarioLogueadoSubject.next(user);
    });
  }

  async registroConEmail(params: { email: string, pass: string }): Promise<User | null>  {
    const res = await createUserWithEmailAndPassword(this.auth, params.email, params.pass);
    return res.user;
  }

  async inicioConEmailYPass(params: { email: string, pass: string }): Promise<User | null> {
    const res = await signInWithEmailAndPassword(this.auth, params.email, params.pass);
    return res.user;
  }

  getDatosUsuario(): Observable<User | null> {
    return this.usuarioLogueado$;
  }

  async cerrarSesion(): Promise<void> {
    await signOut(this.auth);
  }
}
