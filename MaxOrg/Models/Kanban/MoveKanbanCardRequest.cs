namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa los datos que un usuario necesita proporcionar a través del cuerpo de una petición para cambiar de
    /// sección una tarjeta, se utiliza en el método "MoveCard" como una petición del usuario
    /// </summary>
    public class MoveKanbanCardRequest
    {
        /// <summary>
        /// Identificador de la sección a la que se cambiará la tarjeta, debe ser un id valido dentro del tablero
        /// </summary>
        public string NewSectionId { get; set; }
        /// <summary>
        /// Posición dentro de la sección en la que se insertará la tarjeta
        /// </summary>
        public int NewIndex { get; set; }
    }
}