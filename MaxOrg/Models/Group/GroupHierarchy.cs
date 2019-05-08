using System;

namespace MaxOrg.Models.Group
{
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
        public UserGroupView[] Members { get; set; }
    }
}