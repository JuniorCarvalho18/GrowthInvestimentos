import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id?: number;
  usuario_id?: number;
  autor: string;
  tempo?: string;
  texto: string;
  categoria: string;
  imagem?: string;
  curtidas: number;
  comentarios: number;
  curtido?: boolean;
  data_criacao?: string;
}

export interface Comentario {
  id?: number;
  post_id: number;
  usuario_id: number;
  autor: string;
  texto: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = 'http://localhost/GrowthInvestimentos/apiPortal/posts.php';

  constructor(private http: HttpClient) {}

  listarPosts(): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'listar'
    });
  }

  criarPost(post: Post): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'criar',
      ...post
    });
  }

  curtirPost(postId: number, usuarioId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'curtir',
      post_id: postId,
      usuario_id: usuarioId
    });
  }

  deletarPost(postId: number, usuarioId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'deletar',
      id: postId,
      usuario_id: usuarioId
    });
  }

  editarPost(post: Post): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'editar',
      ...post
    });
  }

  adicionarComentario(comentario: Comentario): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'comentar',
      ...comentario
    });
  }

  listarComentarios(postId: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      requisicao: 'listar_comentarios',
      post_id: postId
    });
  }
}
