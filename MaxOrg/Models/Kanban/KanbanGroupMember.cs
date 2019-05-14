using ArangoDB.Client;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa a un miembro dentro de un tablero Kanban, esta clase es utilizada por la clase "KanbanBoard" como un
    /// arreglo para representar a sus miembros, por el controlador de grupos, para agregar a los miembros del tablero
    /// y por el controlador de proyectos, para agregar a un nuevo tablero a los miembros que fueron agregados al grupo,
    /// es utilizada por el controlador de grupos en los métodos "CreateBoard" y "ModifyMembersToBoard", por el controlador
    /// "ProjectsController", en el método "CreateProject" y por la clase "KanbanBoard", como un arreglo indicando los miembros del
    /// grupo
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanGroupMember
    {
        /// <summary>
        /// Indentificador único del usuario que pertenece al tablero Kanban, es representado como la "Key" del usuario
        /// </summary>
        public string UserId { get; set; } = string.Empty;
        /// <summary>
        /// Indica los permisos que tiene el usuario dentro del tablero kanban, siendo estos: Leer, que es el permiso
        /// por defecto y solo permite consultar las tarjetas y su contenido, "Write", que permite modificar las
        /// tarjetas dentro del tablero, eliminar tarjetas y editar la descripción de una tarjeta y "Admin", que permite
        /// hacer las acciones de "Write" y además agregar y eliminar usuarios del grupo, hay un solo administrador por
        /// tablero pero el administrador general del grupo y de los grupos padres tienen también este permiso
        /// </summary>
        public KanbanMemberPermissions MemberPermissions { get; set; } = KanbanMemberPermissions.Read;
    }
}
