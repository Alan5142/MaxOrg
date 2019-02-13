using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Group
    {
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string GroupOwner { get; set; } = "";
        public bool IsRoot { get; set; }
        public DateTime CreationDate { get; set; }

        public List<KanbanBoard> KanbanBoards { get; set; } = new List<KanbanBoard>();
    }

    public class CreateGroupRequest
    {
        [Required]
        public string CurrentGroupId { get; set; }
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        [Required]
        public List<string> Members { get; set; }
        [Required]
        public string SubgroupAdminId { get; set; }
    }

    public class UserGroupView
    {
        public string Id { get; set; }
        public string Username { get; set; }
    }

    public class GroupHierarchy
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string GroupOwner { get; set; }
        public DateTime CreationDate { get; set; }
        public GroupHierarchy[] Subgroups { get; set; } = Array.Empty<GroupHierarchy>();
        public UserGroupView[] Users { get; set; }
    }

    public class ChangeGroupDescriptionRequest
    {
        public string NewDescription { get; set; } = "";
    }
}
