using ArangoDB.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaxOrg.Models
{
    /// <summary>
    /// Chat dentro de la base de datos
    /// </summary>
    public class Chat
    {
        /// <summary>
        /// Identificador del chat
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string key;
        /// <summary>
        /// Todos los mensajes enviados dentro del chat, considerando la forma en que se van insertando, estan ordenados de forma cronologica
        /// </summary>
        public List<Message> Messages { get; set; } = new List<Message>();
        /// <summary>
        /// Booleano que indica si el chat es un grupo
        /// </summary>
        public bool IsGroup { get; set; } = false;
        /// <summary>
        /// Participantes del chat, son identificados por el ID de usuarios
        /// </summary>
        public List<string> Participants { get; set; }
        /// <summary>
        /// Nombre del grupo, en caso de que este chat no sea un grupo su valor será "null" y se mostrará el nombre del otro usuario
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Descripción del grupo, null en caso de que no sea un grupo
        /// </summary>
        public string Description { get; set; }
    }
}
