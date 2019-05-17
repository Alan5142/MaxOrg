using System;
using System.Collections.Generic;
using ArangoDB.Client;
using MaxOrg.Models.Calendar;
using MaxOrg.Models.Kanban;

namespace MaxOrg.Models.Group
{
    /// <summary>
    /// Representa a un grupo dentro de la base de datos
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Group
    {
        /// <summary>
        /// Clave del documento, esta representado como un número
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        /// <summary>
        /// Id del documento de Arango, esta representado como "Group/{Key}" y sirve para agilizar algunas operaciones, especialmente
        /// las de grafos
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        /// <summary>
        /// Nombre del grupo
        /// </summary>
        public string Name { get; set; } = "";

        /// <summary>
        /// Descripción del grupo, es editable por el administrador y esta en formato markdown
        /// </summary>
        public string Description { get; set; } = "";

        /// <summary>
        /// Referencia al administrador del grupo
        /// </summary>
        public string GroupOwner { get; set; } = "";

        /// <summary>
        /// Representa si el grupo es la raíz de todos los grupos, al ser la raíz es un proyecto
        /// </summary>
        public bool IsRoot { get; set; }

        /// <summary>
        /// Identificador del repositorio en GitHub al que esta vinculado este proyecto
        /// </summary>
        public long? LinkedRepositoryName { get; set; } = null;

        /// <summary>
        /// Fecha de creación del proyecto/grupo
        /// </summary>
        public DateTime CreationDate { get; set; }

        /// <summary>
        /// Tarjetas kanban del proyecto, puede tener "n" cantidada
        /// </summary>
        public List<KanbanBoard> KanbanBoards { get; set; } = new List<KanbanBoard>();

        /// <summary>
        /// Lista de eventos para el calendario, solo los tiene el grupo raíz
        /// </summary>
        public List<Event> Events { get; set; }

        /// <summary>
        /// Indica si un proyecto esta terminado, solo es válido para proyectos (IsRoot = true)
        /// </summary>
        public bool Finished { get; set; } = false;

        /// <summary>
        /// Indica el proyecto anterior a este proyecto, solo disponible si "IsRoot" = true
        /// </summary>
        public string PreviousProject { get; set; } = null;
    }
}