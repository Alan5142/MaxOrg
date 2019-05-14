namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Permisos que tiene un miembro dentro de un tablero Kanban, es una propiedad en "KanbanGroupMember" y en "NewMember", además
    /// es utilizado en los controladores "GroupsController" y "ProjectsController" en las acciones que necesiten
    /// modificar los permisos del usuario 
    /// </summary>
    public enum KanbanMemberPermissions
    {
        /// <summary>
        /// El usuario es administrador del tablero Kanban, puede agregar miembros, eliminar miembros, editar, agregar y eliminar
        /// las tarjetas de un tablero
        /// </summary>
        Admin,
        /// <summary>
        /// El usuario puede editar, agregar y eliminar miembros dentro del tablero kanban
        /// </summary>
        Write,
        /// <summary>
        /// El usuario solo puede ver las tarjetas, no puede modificarlas ni agregar nuevas
        /// </summary>
        Read
    }
}
