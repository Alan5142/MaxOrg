namespace MaxOrg.Models.Tests
{
    /// <summary>
    /// Modelo de la respuesta dada por Azure DevOps al pedir los test realizados por un 
    /// </summary>
    public class DevOpsTestResult
    {
        /// <summary>
        /// Identificador unico dentro de Azure DevOps del test
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// Nombre dentro de Azure DevOps del test
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Cantidad de test realizados
        /// </summary>
        public int TotalTests { get; set; }
        /// <summary>
        /// Cantitdad de test que fueron realizados con éxito
        /// </summary>
        public int PassedTests { get; set; }
        /// <summary>
        /// URL web del test realizado
        /// </summary>
        public string WebAccessUrl { get; set; }
    }
}