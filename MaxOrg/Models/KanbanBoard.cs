using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using shortid;

namespace MaxOrg.Models
{
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanCard
    {
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 15);
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.Now;
    }

    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanGroup
    {
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 15);
        public string Name { get; set; }
        public List<KanbanCard> Cards { get; set; } = new List<KanbanCard>();
        public string Color { get; set; } = "";
    }

    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanBoard
    {
        public KanbanBoard(string name = "")
        {
            Name = name;
            KanbanGroups.Add(new KanbanGroup { Name = "En planeación" });
            KanbanGroups.Add(new KanbanGroup { Name = "En proceso" });
            KanbanGroups.Add(new KanbanGroup { Name = "En pruebas" });
            KanbanGroups.Add(new KanbanGroup { Name = "Finalizado" });

            KanbanGroups[0].Cards.Add(new KanbanCard { Title = "Tu primera tarea", Description = "Este es tu nuevo grupo de tarjetas :)" });
        }

        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 15);
        public string Name { get; set; }
        public List<string> Members { get; set; } = new List<string>();
        public List<KanbanGroup> KanbanGroups { get; set; } = new List<KanbanGroup>();
        public DateTime CreationDate { get; set; } = DateTime.Now;
    }

    public class CreateKanbanBoardRequest
    {
        [Required]
        public string Name { get; set; }
    }
}
