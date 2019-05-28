using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Tests
{
    /// <summary>
    /// Modelo de un documento en la colección "Tests" dentro de la base de datos
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase, CollectionName = "Tests")]
    public class Test
    {
        /// <summary>
        /// Identificador unico del documento dentro de la colección, es númerico pero en la base de datos se representa
        /// como un campo de texto
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        /// <summary>
        /// Identificador unico dentro de la base de datos, tiene la forma "Tests/{KEY}" siendo "Key" el identificador unico
        /// dentro de la colección
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        /// <summary>
        /// Identificador unico de la compilación encolada en azure devops
        /// </summary>
        public int BuildId { get; set; }

        /// <summary>
        /// Cantidad de test realizados con exito
        /// </summary>
        public int? Succeeded { get; set; } = null;

        /// <summary>
        /// Cantidad de test que fallaron
        /// </summary>
        public int? Failed { get; set; } = null;

        /// <summary>
        /// Reporte del usuario al administrador, por defecto es nulo hasta que decida realizarlo
        /// </summary>
        public string Description { get; set; } = null;

        /// <summary>
        /// Nombre dado por el creador del test, es utilizado para representar de una forma amigable el test
        /// </summary>
        public string Name { get; set; } = null;

        /// <summary>
        /// Fecha de creación del test
        /// </summary>
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}