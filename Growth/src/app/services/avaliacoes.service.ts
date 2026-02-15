import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Avaliacao {
  id?: number;
  projeto_id: number;
  usuario_id?: number;
  autor: string;
  nota: number;
  comentario: string;
  data?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvaliacoesService {
  private apiUrl = environment.apiUrl.replace('crud1.php', 'avaliacoes.php');

  constructor(private http: HttpClient) {}

  listarAvaliacoes(projetoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?acao=listar&projeto_id=${projetoId}`);
  }

  criarAvaliacao(avaliacao: Avaliacao): Observable<any> {
    return this.http.post(this.apiUrl, {
      acao: 'criar',
      ...avaliacao
    });
  }

  calcularMedia(projetoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?acao=media&projeto_id=${projetoId}`);
  }
}
