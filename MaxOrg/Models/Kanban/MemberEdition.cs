namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa a un miembro que se agregará, modificará o eliminará dentro de un tablero Kanban, es utilizado por
    /// el modelo "ModifyKanbanMembersRequest" como un arreglo, indicando a todos los miembros que se modificará en el proyecto
    /// 
    /// </summary>
    public class MemberEdition
    {
        /// <summary>
        /// Identificador del usuario que se modificará, agregará o eliminará
        /// </summary>
        public string User { get; set; } = string.Empty;
        /// <summary>
        /// Permisos que se le darán al usuario, siendo estos "Read" o "Write"
        /// </summary>
        public KanbanMemberPermissions MemberPermissions { get; set; } = KanbanMemberPermissions.Read;
    }
}