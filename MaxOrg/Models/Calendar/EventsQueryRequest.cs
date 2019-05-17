using System;

namespace MaxOrg.Models.Calendar
{
    public class EventsQueryRequest
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}