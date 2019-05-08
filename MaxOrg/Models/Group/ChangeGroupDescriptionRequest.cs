namespace MaxOrg.Models.Group
{
    /// <summary>
    /// Request del usuario para cambiar la descripciónd de un grupo
    /// </summary>
    public class ChangeGroupDescriptionRequest
    {
        /// <summary>
        /// Nueva descripción del grupo
        /// </summary>
        public string NewDescription { get; set; } = "";
    }
}