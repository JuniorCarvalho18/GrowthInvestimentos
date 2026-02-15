import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Avaliacao {
  id?: number;
  projeto_id: number;
  usuario_id: number; // Removido '?' para forçar a existência do ID e tipo Number
  autor: string;
  autor_nome?: string;
  autor_foto?: string;
  nota: number;
  comentario: string;
  data?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvaliacoesService {
  // Garante que a URL aponte corretamente para o novo arquivo PHP
  private apiUrl = environment.apiUrl.replace('crud1.php', 'avaliacoes.php');

  constructor(private http: HttpClient) {}

  listarAvaliacoes(projetoId: number): Observable<{success: boolean, avaliacoes: Avaliacao[]}> {
    return this.http.get<{success: boolean, avaliacoes: Avaliacao[]}>(
      `${this.apiUrl}?acao=listar&projeto_id=${projetoId}`
    );
  }

  // O método criar serve tanto para Criar quanto para Atualizar (Upsert no PHP)
  criarAvaliacao(avaliacao: Avaliacao): Observable<any> {
    return this.http.post(this.apiUrl, {
      acao: 'criar',
      ...avaliacao
    });
  }

  calcularMedia(projetoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?acao=media&projeto_id=${projetoId}`);
  }

  deletarAvaliacao(id: number): Observable<any> {
  return this.http.post(this.apiUrl, {
    acao: 'deletar',
    id: id
  });
}
}
