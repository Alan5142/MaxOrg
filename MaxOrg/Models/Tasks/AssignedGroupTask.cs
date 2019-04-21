using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models.Tasks
{

    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "AssignedGroupTasks")]
    public class AssignedGroupTask
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string ToDoTask { get; set; }

        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Group { get; set; }
    }
}
