using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models.Tasks
{
    public class ModifyTaskRequest
    {
        public string NewName { get; set; }
        public string NewDescription { get; set; }
        public short? NewProgress { get; set; }
    }
}
