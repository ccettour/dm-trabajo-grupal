import {Component, OnInit} from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonRouterLink, IonMenu, IonMenuButton, Platform, IonButtons,
  IonImg, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonFooter
} from '@ionic/angular/standalone';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonRouterLink, RouterLink, IonMenu, IonMenuButton,
    IonButtons, IonImg, IonItem, IonThumbnail, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonFooter],
})
export class HomePage implements OnInit {
  private backButtonSubscription: any;

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    console.log('onInit');
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(0, () => {
      });
    });
  }

  ionViewDidLeave() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  async salir(): Promise<void> {
    await this.authService.cerrarSesion();
    await this.router.navigate(['/login']);
  }
}
