import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TestsService {

  constructor(private http: HttpClient) { }

  linkToken(groupId: string, code: string) {
    return this.http.post(`/api/groups/${groupId}/devops?code=${code}`, {});
  }
}
