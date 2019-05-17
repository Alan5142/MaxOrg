import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material";
import {DayEventsComponent} from "./day-events/day-events.component";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Event} from "../../services/calendar/event";
import {CalendarService} from "../../services/calendar/calendar.service";
import {map, shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  currentDate: Date;
  calendarFilterDate: Date;
  dates: Date[] = [];
  groupId = '';
  events: Observable<Event[]>;

  constructor(private dialog: MatDialog,
              private route: ActivatedRoute,
              private calendarService: CalendarService) {
    this.currentDate = new Date();
    this.calendarFilterDate = new Date();

    route.parent.params.subscribe(params => {
      this.groupId = params['id'];
      this.events = this.calendarService.getProjectEvents(this.groupId).pipe(shareReplay(1));
      this.events.subscribe(ev => console.log(ev));
    });

    this.refreshCalendar();
  }

  ngOnInit() {
  }

  getMonthName(): string {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[this.calendarFilterDate.getMonth()];
  }

  goToPreviousMonth() {
    this.calendarFilterDate.setMonth(this.calendarFilterDate.getMonth() - 1);
    this.refreshCalendar();
  }

  goToNextMonth() {
    this.calendarFilterDate.setMonth(this.calendarFilterDate.getMonth() + 1);
    this.refreshCalendar();
  }

  compareDates(): boolean {
    return this.calendarFilterDate.getMonth() === this.currentDate.getMonth() &&
      this.calendarFilterDate.getFullYear() === this.currentDate.getFullYear() &&
      this.calendarFilterDate.getDate() === this.currentDate.getDate();
  }

  private refreshCalendar() {
    this.dates = [];
    const tempDate = new Date(this.calendarFilterDate);
    tempDate.setDate(1);
    for (let i = 0; i < 7; i++) {
      if (tempDate.getDay() !== i) {
        this.dates.push(null);
      } else {
        break;
      }
    }
    while (tempDate.getMonth() === this.calendarFilterDate.getMonth()) {
      const dateToInsert = new Date(tempDate);
      this.dates.push(dateToInsert);
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }

  openDayEvents(date: Date) {
    const dayEvents = this.events.pipe(map<Event[], Event[]>(events => {
      return events.filter(e => {
        return e.eventDate.toDateString() === date.toDateString();
      })
    }));
    const dialog = this.dialog.open(DayEventsComponent, {width: '300px', data: dayEvents});
  }
}
