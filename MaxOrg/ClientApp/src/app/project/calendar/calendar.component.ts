import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  currentDate: Date;
  calendarFilterDate: Date;
  dates: Date[] = [];

  constructor() {
    this.currentDate = new Date();
    this.calendarFilterDate = new Date();

    this.refreshCalendar();
  }

  ngOnInit() {
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
}
