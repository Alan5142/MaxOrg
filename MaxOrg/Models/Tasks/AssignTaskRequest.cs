using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models.Tasks
{
    public class AssignTaskRequest
    {
        public string GroupId { get; set; }
        public string UserId { get; set; }
    }
}
