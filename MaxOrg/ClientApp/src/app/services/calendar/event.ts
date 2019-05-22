import {EventColor, EventAction} from "calendar-utils";

export interface DateEvent<MetaType = any>{
  id?: string | number;
  start: Date;
  end?: Date;
  title: string;
  color?: EventColor;
  actions?: EventAction[];
  allDay?: boolean;
  cssClass?: string;
  resizable?: {
    beforeStart?: boolean;
    afterEnd?: boolean;
  };
  draggable?: boolean;
  meta?: MetaType;

  description?: string;
  creator?: string;
  canEdit?: boolean;
}
