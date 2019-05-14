namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Modelo de la petición realizada por un usuario para editar la información de una sección, pudiendo cambiar
    /// el nombre y el color de la misma, es utilizada por el método "ModifyKanbanSection" como un parametro de la función
    /// </summary>
    public class ModifyKanbanSectionRequest
    {
        /// <summary>
        /// Nuevo nombre que se le dará a la sección Kanban, 
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Nuevo color que se le dará a la sección Kanban
        /// </summary>
        public string Color { get; set; }
    }
}