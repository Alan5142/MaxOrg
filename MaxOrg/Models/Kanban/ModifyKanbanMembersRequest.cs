using System.Collections.Generic;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Modelo de una petición realizada por un usuario para modificar los miembros de un tablero, es utilizado
    /// por el método "ModifyMembersToBoard" como parametro
    /// </summary>
    public class ModifyKanbanMembersRequest
    {
        /// <summary>
        /// Lista final de los miembros del tablero, si un miembro existente no esta en esta lista se eliminará del tablero
        /// </summary>
        public List<MemberEdition> MembersToEdit { get; set; }
    }
}