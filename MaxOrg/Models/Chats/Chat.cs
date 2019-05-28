using System.Collections.Generic;
using ArangoDB.Client;

namespace MaxOrg.Models.Chats
{
    /// <summary>
    /// Chat dentro de la base de datos
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Chat
    {
        /// <summary>
        /// Identificador del chat
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Key)]
        public string Key { get; set; }

        /// <summary>
        /// Identificador completo del chat, esta representado en ArangoDB como: "Chat/Key", siendo Key el campo de arriba, el
        /// cual es un identificador generado por el mismo ArangoDB
        /// </summary>
        [DocumentProperty(Identifier = IdentifierType.Handle)]
        public string Id { get; set; }

        /// <summary>
        /// Todos los mensajes enviados dentro del chat, considerando la forma en que se van insertando, estan ordenados de forma cronologica
        /// </summary>
        public List<Message> Messages { get; set; } = new List<Message>();

        /// <summary>
        /// Identificador del proyecto, sirve para hacer la relación entre el chat y el proyecto al que pertenece
        /// </summary>
        public string ProjectId { get; set; }
        
        /// <summary>
        /// Booleano que indica si el chat es un grupo
        /// </summary>
        public bool IsGroup { get; set; } = false;

        /// <summary>
        /// Nombre del grupo, en caso de que este chat no sea un grupo su valor será "null" y se mostrará el nombre del otro usuario
        /// </summary>
        public string Name { get; set; } }
}