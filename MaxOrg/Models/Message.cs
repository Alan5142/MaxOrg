using System;
using ArangoDB.Client;

namespace MaxOrg.Models
{
    public enum MessageType
    {
        Text,
        Image,
        Video
    }

    /// <summary>
    /// Representa un mensaje dentro de un chat
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Message
    {
        /// <summary>
        /// Remitente del mensaje
        /// </summary>
        public string Remitent { get; set; }

        /// <summary>
        /// Fecha de emisión del mensaje
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Tipo de mensaje, la mayoria de los mensajes son de texto, pero al tener un registro del tipo de mensaje podemos utilizar distintas formas
        /// para visualizar cada uno de los tipos
        /// </summary>
        public MessageType Type { get; set; }

        /// <summary>
        /// Datos del mensaje, puede ser texto o un enlace en caso de que sea video o imágen
        /// </summary>
        public string Data { get; set; }
    }
}