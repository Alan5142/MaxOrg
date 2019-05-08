namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa los datos que un usuario necesita proporcionar a través del cuerpo de una petición para cambiar de
    /// sección una tarjeta, se utiliza en conjunto con un metodo
    /// </summary>
    public class MoveKanbanCardRequest
    {
        public string NewSectionId { get; set; }
        public int NewIndex { get; set; }
    }
}