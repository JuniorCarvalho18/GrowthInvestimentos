import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventEmitter } from '@angular/core';

export interface Projeto {
  id?: number;
  nome: string;
  descricao: string;
  meta: number;
  arrecadado?: number;
  previsao: string;
  local: string;
  imagem?: string;
  categoria?: string;
  status?: 'ativo' | 'concluido' | 'cancelado';
  impacto_estimado?: string;
  data_criacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetosService {
  // AJUSTE AQUI COM O NOME DA SUA PASTA NO HTDOCS
  private apiUrl = 'http://localhost/GrowthInvestimentos/apiPortal/projetos.php';
  projetosCriados = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  listarProjetos(): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'listar'
    });
  }

  salvarProjeto(projeto: Projeto): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'salvar',
      ...projeto
    });
  }

  editarProjeto(projeto: Projeto): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'editar',
      ...projeto
    });
  }

  deletarProjeto(id: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'deletar',
      id
    });
  }

  buscarProjeto(id: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'buscar',
      id
    });
  }
}
