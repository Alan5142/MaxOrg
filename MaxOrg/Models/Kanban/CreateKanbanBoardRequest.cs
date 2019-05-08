using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Petición del usuario para crear un nuevo tablero, se utiliza en conjunto con un método para la creación de grupos,
    /// por esto mismo solo guarda el nombre del nuevo tablero.
    /// </summary>
    public class CreateKanbanBoardRequest
    {
        /// <summary>
        /// Nombre con el que se creará el nuevo grupo de tarjetas
        /// </summary>
        [Required]
        public string Name { get; set; }
    }
}