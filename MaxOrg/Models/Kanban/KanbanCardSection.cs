using System.Collections.Generic;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa una sección de tarjetas, es donde se almacenan tarjetas que estan en cierta fase de un
    /// proceso
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanCardSection
    {
        /// <summary>
        /// Identificador de la sección de tarjetas, esta compuesto de caracteres alfanúmericos y tiene una longitud de 20
        /// caracteres
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);

        /// <summary>
        /// Nombre de la sección de tarjetas, ayuda a los usuarios a identificar la función de determinada sección de tarjetas
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Tarjetas pertenecientes a una sección 
        /// </summary>
        public List<KanbanCard> Cards { get; set; } = new List<KanbanCard>();

        /// <summary>
        /// Color de la sección, es personalizable por el usuario.
        /// </summary>
        public string Color { get; set; } = "#6495ed";
    }
}