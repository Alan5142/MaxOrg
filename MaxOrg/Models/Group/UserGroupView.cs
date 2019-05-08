namespace MaxOrg.Models.Group
{
    /// <summary>
    /// Representa una vista de un usuario dentro de un grupo, esta identificado por el Id del usuario y del usuario
    /// </summary>
    public class UserGroupView
    {
        /// <summary>
        /// Id del usuario que esta en el grupo
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// Nombre de usuario que esta en el grupo
        /// </summary>
        public string Username { get; set; }
    }
}