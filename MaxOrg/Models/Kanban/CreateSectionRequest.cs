using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Petición realizada por el usuario para crear una nueva sección, es utilizado por el método "CreateSection" en
    /// el controlador de grupos
    /// </summary>
    public class CreateSectionRequest
    {
        /// <summary>
        /// Nombre de la nueva sección, es una cadena de texto y es requerida
        /// </summary>
        [Required]
        public string Name { get; set; }
    }
}
