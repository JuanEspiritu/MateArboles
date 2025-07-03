import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicepythonService {
  private apiUrl = 'http://localhost:5000/api/recorridos'; // Cambia el puerto si tu Flask corre en otro
  private apiEvalUrl = 'http://localhost:5000/api/evaluar';

  constructor(private http: HttpClient) { }

  obtenerRecorridos(expresion: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { expresion });
  }

  evaluarExpresion(expresion: string, valores: {[key: string]: any}): Observable<any> {
    return this.http.post<any>(this.apiEvalUrl, { expresion, valores });
  }
}
