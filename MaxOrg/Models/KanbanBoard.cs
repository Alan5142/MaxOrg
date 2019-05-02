using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using shortid;
using MaxOrg.Models.Kanban;

namespace MaxOrg.Models
{
    /// <summary>
    /// Representa una tarjeta Kanban almacenada en la base de datos, es un subcampo de "KanbanGroup"
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanCard
    {
        /// <summary>
        /// Identificador de la tarjeta Kanban, esta representado como un identificador de 20 digitos que puede contener caracteres
        /// alfanúmericos
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);
        /// <summary>
        /// Titulo de la tarjeta, proporciona a los usuarios un titulo con el nombre de la actividad a desempeñar
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// Descripción detallada de la tarjeta, proporciona información más detallada de la tarjeta
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Fecha de creación de la tarjeta
        /// </summary>
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Representa una sección de tarjetas, es donde se almacenan tarjetas que estan en cierta fase de un
    /// proceso
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanCardSection
    {
        /// <summary>
        /// Identificador de la sección de tarjetas, esta compuesto de caracteres alfanúmericos y tiene una longitud de 20
        /// caracteres
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);
        /// <summary>
        /// Nombre de la sección de tarjetas, ayuda a los usuarios a identificar la función de determinada sección de tarjetas
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Tarjetas pertenecientes a una sección 
        /// </summary>
        public List<KanbanCard> Cards { get; set; } = new List<KanbanCard>();
        /// <summary>
        /// Color de la sección, es personalizable por el usuario.
        /// </summary>
        public string Color { get; set; } = "#6495ed";
    }

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

    /// <summary>
    /// Petición del usuario para crear un nuevo tablero, se utiliza en conjunto con un método para la creación de grupos,
    /// por esto mismo solo guarda el nombre del nuevo tablero.
    /// </summary>
    public class CreateKanbanBoardRequest
    {
        /// <summary>
        /// Nombre con el que se creará el nuevo grupo de tarjetas
        /// </summary>
        [Required] public string Name { get; set; }
    }

    /// <summary>
    /// Representa los datos de una petición del usuario para crear una nueva tarjeta en una sección determinada, se
    /// utiliza en conjunto con un método para la creación de tarjetas, pues esta clase es uno de los parametros que recibe
    /// ese método, estos datos son proporcionados por el cliente a través del cuerpo de una petición
    /// </summary>
    public class CreateKanbanCardInSectionRequest
    {
        /// <summary>
        /// Nombre de la tarjeta
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Descripción de la tarjeta
        /// </summary>
        public string Description { get; set; }
    }

    /// <summary>
    /// Representa los datos que un usuario necesita proporcionar a través del cuerpo de una petición para cambiar de
    /// sección una tarjeta, se utiliza en conjunto con un metodo
    /// </summary>
    public class MoveKanbanCardRequest
    {
        public string NewSectionId { get; set; }
        public int NewIndex { get; set; }
    }
}