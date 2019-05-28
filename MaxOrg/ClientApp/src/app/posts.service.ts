import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private http: HttpClient) { }

  public createPost(groupId: string, content: string) {
    return this.http.post(`/api/groups/${groupId}/posts`, {content: content});
  }

  public getPosts(groupId: string): Observable<any> {
    return this.http.get(`/api/groups/${groupId}/posts`);
  }

  public makeComment(groupId: string, postId: string, content: string) {
    return this.http.post(`/api/groups/${groupId}/posts/${postId}/comment`, {content: content});
  }
}
