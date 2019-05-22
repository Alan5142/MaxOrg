import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {DateEvent} from "./event";

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private http: HttpClient) { }

  public getProjectEvents(groupId: string) {
    return this.http.get<DateEvent[]>(`${environment.apiUrl}groups/${groupId}/calendar`);
  }

  public createEvent(groupId: string, eventToCreate: DateEvent) {
    return this.http.post(`${environment.apiUrl}groups/${groupId}/calendar`, eventToCreate);
  }

  public modifyEvent(groupId: string, eventId: string, event: DateEvent) {
    return this.http.put(`${environment.apiUrl}groups/${groupId}/calendar/${eventId}`, event);
  }

  public deleteEvent(groupId: string, eventId: string) {
    return this.http.delete(`${environment.apiUrl}groups/${groupId}/calendar/${eventId}`);
  }
}
