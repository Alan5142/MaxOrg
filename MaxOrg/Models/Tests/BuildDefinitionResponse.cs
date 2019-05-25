namespace MaxOrg.Models.Tests
{
    /// <summary>
    /// Modelo de la respuesta dada por Azure DevOps al realizar una consulta de los perfiles
    /// de compilación de un proyecto, esta clase es utilizada en el método "GetBuildDefinitions" para mapear
    /// la respuesta Json de Azure DevOps a esta clase
    /// </summary>
    public class BuildDefinitionResponse
    {
        /// <summary>
        /// Cantidad de perfiles existentes en el proyecto
        /// </summary>
        public int Count { get; set; }
        /// <summary>
        /// Arreglo con los perfiles de compilación existentes
        /// </summary>
        public BuildDefinition[] Value { get; set; }
    }
}