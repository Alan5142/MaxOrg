using System;
using System.Collections.Generic;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa un tablero kanban en un grupo de trabajo, contiene secciones y a su vez las secciones contienen tarjetas
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanBoard
    {
        /// <summary>
        /// Constructor del tablero, inicializa un tablero para que contenga 4 secciones:
        /// * En planeación
        /// * En proceso
        /// * En pruebas
        /// * Finalizado
        /// y una tarjeta por defecto en la sección de planeación
        /// </summary>
        /// <param name="name"></param>
        public KanbanBoard(string name = "")
        {
            Name = name;
            KanbanGroups.Add(new KanbanCardSection {Name = "En planeación"});
            KanbanGroups.Add(new KanbanCardSection {Name = "En proceso"});
            KanbanGroups.Add(new KanbanCardSection {Name = "En pruebas"});
            KanbanGroups.Add(new KanbanCardSection {Name = "Finalizado"});

            KanbanGroups[0].Cards.Add(new KanbanCard
                {Title = "Tu primera tarea", Description = "Este es tu nuevo grupo de tarjetas :)"});
        }

        /// <summary>
        /// Identificador del tablero, consiste en caracteres alfanúmericos y tiene una longitud de 20 caracteres
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);

        /// <summary>
        /// Nombre del tablero, ayuda al usuario a determinar que tipo de tarjetas se encontrará en su interior.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Identificadores unicos de los usuarios que pertenecen a determinado tablero
        /// </summary>
        public List<KanbanGroupMember> Members { get; set; } = new List<KanbanGroupMember>();

        /// <summary>
        /// Secciones de un tablero, estas secciones son las que almacenan las tarjetas
        /// </summary>
        public List<KanbanCardSection> KanbanGroups { get; set; } = new List<KanbanCardSection>();

        /// <summary>
        /// Fecha de creación del tablero
        /// </summary>
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}