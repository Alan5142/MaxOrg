using System;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Representa una tarjeta Kanban almacenada en la base de datos, es un subcampo de "KanbanGroup"
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class KanbanCard
    {
        /// <summary>
        /// Identificador de la tarjeta Kanban, esta representado como un identificador de 20 digitos que puede contener caracteres
        /// alfanúmericos
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);

        /// <summary>
        /// Titulo de la tarjeta, proporciona a los usuarios un titulo con el nombre de la actividad a desempeñar
        /// </summary>
        public string Title { get; set; } = "";

        /// <summary>
        /// Descripción pequeña de la tarjeta, proporciona una breve descripción de la actividad
        /// </summary>
        public string Description { get; set; } = "";

        /// <summary>
        /// Descripción detallada de la tarjeta, propociona a detalle la actividad
        /// </summary>
        public string DetailedDescription { get; set; } = "";

        /// <summary>
        /// Fecha de creación de la tarjeta
        /// </summary>
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
    }
}