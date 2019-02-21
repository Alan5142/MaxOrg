using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
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
        /// Fecha de creación del proyecto/grupo
        /// </summary>
        public DateTime CreationDate { get; set; }

        /// <summary>
        /// Tarjetas kanban del proyecto, puede tener "n" cantidada
        /// </summary>
        public List<KanbanBoard> KanbanBoards { get; set; } = new List<KanbanBoard>();
    }
    /// <summary>
    /// Estructura de la petición de un cliente para crear un nuevo subgrupo
    /// </summary>
    public class CreateGroupRequest
    {
        /// <summary>
        /// Id del grupo actual, es para referenciar el grupo padre con el grupo hijo
        /// </summary>
        [Required]
        public string CurrentGroupId { get; set; }
        /// <summary>
        /// Nombre del subgrupo, el creador del subgrupo da el nombre
        /// </summary>
        [Required]
        public string Name { get; set; }
        /// <summary>
        /// Descripción del grupo, es opcional y debe estar en formato markdown
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Lista de miembros del proyecto excluyendo al administrador del subgrupo
        /// </summary>
        [Required]
        public List<string> Members { get; set; }
        /// <summary>
        /// Id del administrador del subgrupo
        /// </summary>
        [Required]
        public string SubgroupAdminId { get; set; }
    }

    /// <summary>
    /// Representa una vista de un usuario dentro de un grupo, esta identificado por el Id del usuario y del usuario
    /// </summary>
    public class UserGroupView
    {
        /// <summary>
        /// Id del usuario que esta en el grupo
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// Nombre de usuario que esta en el grupo
        /// </summary>
        public string Username { get; set; }
    }

    /// <summary>
    /// Vista sobre la jerarquía de un grupo
    /// </summary>
    public class GroupHierarchy
    {
        /// <summary>
        /// Id del grupo del que se esta viendo la jerarquía
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// Nombre del grupo actual
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Descripción del grupo
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Nombre del administrador del grupo
        /// </summary>
        public string GroupOwner { get; set; }
        /// <summary>
        /// Fecha de creación del proyecto
        /// </summary>
        public DateTime CreationDate { get; set; }
        /// <summary>
        /// Subgrupos del grupo actual, se representa
        /// </summary>
        public GroupHierarchy[] Subgroups { get; set; } = Array.Empty<GroupHierarchy>();
        /// <summary>
        /// Vista de los usuarios compuesta por id y nombre de usuario
        /// </summary>
        public UserGroupView[] Users { get; set; }
    }

    /// <summary>
    /// Request del usuario para cambiar la descripciónd de un grupo
    /// </summary>
    public class ChangeGroupDescriptionRequest
    {
        /// <summary>
        /// Nueva descripción del grupo
        /// </summary>
        public string NewDescription { get; set; } = "";
    }
}
