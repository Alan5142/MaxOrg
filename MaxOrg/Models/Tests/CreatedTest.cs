using ArangoDB.Client;

namespace MaxOrg.Models.Tests
{
    /// <summary>
    /// Colección de grafos en la base de datos que conecta un test realizado en la plataforma de Azure DevOps con
    /// un grupo en concreto, también cuenta con información de quien creo el test 
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "CreatedTests")]
    public class CreatedTest
    {
        /// <summary>
        /// Identificador unico dentro de la colección, sirve para identificar el documento dentro de la colección y sigue
        /// un formato númerico
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        /// <summary>
        /// Identificador unico global dentro de la base de datos, es utilizado para identificar el documento dentro de toda
        /// la base de datos, sigue el formato: "CreatedTests/{KEY}" siendo "KEY" el identificador unico del documento dentro de la
        /// colecciónn
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        /// <summary>
        /// Identificador del grupo en el que se creo el test, es el punto de inicio del grafo
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.EdgeFrom)]
        public string Group { get; set; }

        /// <summary>
        /// Identificador del test que se esta realizando/se realizó, es el punto final del grafo
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.EdgeTo)]
        public string Test { get; set; }

        /// <summary>
        /// Identificador del creador del test
        /// </summary>
        public string CreatorId { get; set; }
    }
}