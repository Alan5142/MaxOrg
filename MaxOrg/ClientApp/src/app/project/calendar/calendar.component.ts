import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {addDays, addHours, endOfDay, endOfMonth, isSameDay, isSameMonth, startOfDay, subDays} from 'date-fns';
import {Subject} from 'rxjs';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';
import {CustomDateFormatter} from "./custom-date-formatter.provider";
import {ThemeService} from "../../services/theme.service";
import {MatPaginator, MatSnackBar, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {DateEvent} from "../../services/calendar/event";
import {CalendarService} from "../../services/calendar/calendar.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit {
  public colors: any = {
    low: {
      primary: '#43a047',
      secondary: '#66bb6a'
    },
    medium: {
      primary: '#1976d2',
      secondary: '#90caf9'
    },
    high: {
      primary: '#d32f2f',
      secondary: '#e57373'
    }
  };

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  displayedColumns: string[] = ['title', 'priority', 'starts', 'ends', 'save', 'delete'];

  dataSource: MatTableDataSource<CalendarEvent>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({event}: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({event}: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: DateEvent[] = [];

  groupId: string;

  activeDayIsOpen: boolean = false;

  constructor(public themeService: ThemeService,
              private calendarService: CalendarService,
              activatedRoute: ActivatedRoute,
              private snackBar: MatSnackBar) {
    this.dataSource = new MatTableDataSource(this.events);
    activatedRoute.parent.params.subscribe(params => {
      this.groupId = params['id'];
      this.calendarService.getProjectEvents(this.groupId).subscribe(events => {
        console.log(events);
        this.updateData();
      });
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  dayClicked({date, events}: { date: Date; events: DateEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0);
    }
  }

  eventTimesChanged({
                      event,
                      newStart,
                      newEnd
                    }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: DateEvent): void {
  }

  addEvent(): void {
    const event: DateEvent = {
      title: 'Nuevo evento',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: this.colors.low,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    };
    this.calendarService.createEvent(this.groupId, event).subscribe(() => {
      this.updateData();
    });
  }

  deleteEvent(eventToDelete: DateEvent) {
    this.calendarService.deleteEvent(this.groupId, eventToDelete.id as string).subscribe(() => {
      this.updateData();
    });
  }

  updateData() {
    this.calendarService.getProjectEvents(this.groupId).subscribe(events => {
      this.dataSource.data = events.map<DateEvent>(e => {
        return {
          actions: e.actions,
          allDay: e.canEdit,
          canEdit: e.canEdit,
          color: e.color,
          creator: e.creator,
          description: e.description,
          cssClass: e.cssClass,
          draggable: e.draggable,
          end: new Date(e.end),
          id: e.id,
          meta: e.meta,
          resizable: e.resizable,
          start: new Date(e.start),
          title: e.title
        };
      });
      this.events = this.dataSource.data;
      this.dataSource.paginator = this.paginator;
      this.refresh.next();
    })
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  modifyEvent(element: DateEvent) {
    this.calendarService.modifyEvent(this.groupId, element.id as string, element).subscribe(() => {
      this.snackBar.open('Editado con exito', 'OK', {duration: 2000});
      this.updateData();
    });
  }
}
