using System;
using ArangoDB.Client;

namespace MaxOrg.Models.Chats
{
    /// <summary>
    /// Representa un mensaje dentro de un chat
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Message
    {
        /// <summary>
        /// Remitente del mensaje
        /// </summary>
        public string Sender { get; set; }

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
        
        /// <summary>
        /// Identificador unico del archivo, se utiliza un string de 30 digitos con la finalidad de evitar colisiones con cualquier archivo que se desee enviar en
        /// el chat
        /// </summary>
        public string AttachmentId { get; set; }
        
        /// <summary>
        /// Nombre del archivo que se subió al chat, es utilizado para mostrar el nombre del archivo de una manera amigable dentro del chat
        /// </summary>
        public string AttachmentName { get; set; }
        
        public string SenderId { get; set; }
    }
}