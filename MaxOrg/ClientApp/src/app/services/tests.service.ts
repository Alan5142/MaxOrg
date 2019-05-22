import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TestsService {

  constructor(private http: HttpClient) { }

  linkToken(groupId: string, code: string) {
    return this.http.post(`/api/groups/${groupId}/devops?code=${code}`, {});
  }

  createTest(groupId: string, buildDefinition: number, name: string) {
    return this.http.post(`/api/groups/${groupId}/tests`, {
      definitionId: buildDefinition,
      name: name
    });
  }

  getTests(groupId: string): Observable<any> {
    return this.http.get<any>(`/api/groups/${groupId}/tests`);
  }

  getBuildDefinitions(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/groups/${groupId}/tests/build-definitions`);
  }

  updateReport(groupId: string, testId: string, report: string) {
    return this.http.put(`/api/groups/${groupId}/tests/${testId}`, {description: report});
  }

  getReportById(groupId: string, testId: string): Observable<any> {
    return this.http.get<any>(`/api/groups/${groupId}/tests/${testId}`);
  }
}
