using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Group
{
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
}