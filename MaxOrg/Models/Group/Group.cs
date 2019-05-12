using System;
using System.Collections.Generic;
using ArangoDB.Client;
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
        
        public string LinkedRepositoryName { get; set; }

        /// <summary>
        /// Fecha de creación del proyecto/grupo
        /// </summary>
        public DateTime CreationDate { get; set; }

        /// <summary>
        /// Tarjetas kanban del proyecto, puede tener "n" cantidada
        /// </summary>
        public List<KanbanBoard> KanbanBoards { get; set; } = new List<KanbanBoard>();
    }
}