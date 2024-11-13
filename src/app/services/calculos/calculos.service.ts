import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalculosService {

  constructor() { }

  async calcularCalorias(kmxh: number, duracion:number, peso:number) {
    let coeficienteIntensidad: number;
    let caloriasQuemadas: number;

    if(kmxh<=5){
      coeficienteIntensidad = 0.55;
    } else if(kmxh>5 && kmxh<=6.5){
      coeficienteIntensidad = 0.65;
    } else {
      coeficienteIntensidad = 1;
    }

    if(peso > 0){
      caloriasQuemadas = peso * kmxh * coeficienteIntensidad * (duracion/60);
    } else {
      caloriasQuemadas = 0;
    }
    return caloriasQuemadas;
  }

  formatearDuracion(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = Math.floor(segundos % 60);
    return `${this.agregarCero(horas)}:${this.agregarCero(minutos)}:${this.agregarCero(segundosRestantes)}`;
  }

  agregarCero(valor: number): string {
    return valor < 10 ? `0${valor}` : `${valor}`;
  }

  // Calcula la distancia entre dos puntos usando la fórmula Haversine
  calcularDistancia(start: { lat: number; lng: number; }, end: { lat: any; lng: any; }) {
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(end.lat - start.lat);
    const dLon = this.deg2rad(end.lng - start.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(start.lat)) * Math.cos(this.deg2rad(end.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
