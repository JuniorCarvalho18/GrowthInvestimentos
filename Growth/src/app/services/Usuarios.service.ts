import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  cnpj: string;
  senha?: string;
  saldo?: number;
  tokens?: number;
  data_cadastro?: string;
  ultimo_acesso?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'listar'
    });
  }

  salvarUsuario(usuario: Usuario): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'salvar',
      ...usuario
    });
  }

  editarUsuario(usuario: Usuario): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'editar',
      ...usuario
    });
  }

  deletarUsuario(id: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'deletar',
      id
    });
  }

  buscarUsuario(id: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'perfil',
      id
    });
  }
}
