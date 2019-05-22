namespace MaxOrg.Models.Group
{
    /// <summary>
    /// Petición que realiza un usuario administrador cuando desea modificar los datos de un grupo
    /// </summary>
    public class EditGroupRequest
    {
        /// <summary>
        /// Establece el identificador del repositorio en GitHub, solo disponible si el grupo es la raíz del proyecto
        /// </summary>
        public long? LinkedRepositoryName { get; set; } = null;
        /// <summary>
        /// Nuevo nombre del proyecto
        /// </summary>
        public string Name { get; set; } = null;
        /// <summary>
        /// Nuevo administrador del grupo
        /// </summary>
        public string GroupOwner { get; set; } = null;
        /// <summary>
        /// Nueva descripción del grupo
        /// </summary>
        public string Description { get; set; } = null;
    }
}