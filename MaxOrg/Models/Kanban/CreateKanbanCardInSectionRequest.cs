namespace MaxOrg.Models.Kanban
{
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
}