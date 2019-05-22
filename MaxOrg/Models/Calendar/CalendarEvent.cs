using System;
using shortid;

namespace MaxOrg.Models.Calendar
{
    public class CalendarEvent
    {
        public string Id { get; set; } = ShortId.Generate(true, false, 15);
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Title { get; set; }
        public EventColor Color { get; set; }
        public EventResizable Resizable { get; set; }
        public string Meta { get; set; }
        public bool AllDay { get; set; } = false;
        
        public string Creator { get; set; } = "";
        public string Description { get; set; }
    }
}