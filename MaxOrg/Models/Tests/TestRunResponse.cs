namespace MaxOrg.Models.Tests
{
    /// <summary>
    /// Modelo que representa a la respuesta dada por Azure DevOps al momento de pedir los resultados de un test
    /// </summary>
    public class TestRunResponse
    {
        /// <summary>
        /// Cantidad de elementos que existen, por la forma en que se realizan se espera que sea 1 si ya se realizo y 0
        /// si todavía no termina
        /// </summary>
        public int Count { get; set; }
        /// <summary>
        /// Lista con los resultados, se espera que este vacia o que contenga un elemento
        /// </summary>
        public DevOpsTestResult[] Value { get; set; }
    }
}