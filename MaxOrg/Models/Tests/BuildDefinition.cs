namespace MaxOrg.Models.Tests
{
    /// <summary>
    /// Modelo que representa una configuración de compilación en Azure DevOps
    /// </summary>
    public class BuildDefinition
    {
        /// <summary>
        /// Nombre de la configuración de compilación
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Dirección URL de la configuración de compilación
        /// </summary>
        public string Uri { get; set; }
        /// <summary>
        /// Identificador de la configuración de compilación
        /// </summary>
        public int Id { get; set; } 
    }
}