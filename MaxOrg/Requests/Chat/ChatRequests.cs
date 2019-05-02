using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Requests.Chat
{
    /// <summary>
    /// Clase utilizada para almacenar la petición HTTP que realiza un cliente cuando desea enviar un mensaje a un chat.
    /// </summary>
    public class SendMessageRequest
    {
        /// <summary>
        /// Mensaje de texto que el usuario desea enviar al chat, este campo es requerido
        /// </summary>
        [Required]
        public string Message { get; set; }
    }

    /// <summary>
    /// Clase utilizada para almacenar la petición HTTP que realiza un cliente cuando desea agregar otro miembro a un chat.
    /// </summary>
    public class AddUserToChatRequest
    {
        /// <summary>
        /// Identificador del usuario que se desea agregar al chat, este campo es requerido.
        /// </summary>
        [Required]
        public string UserId { get; set; }
    }

    /// <summary>
    /// Modelo utilizado para almacenar la petición HTTP que realiza un cliente cuando desea crear un chat en determinado proyecto
    /// </summary>
    public class CreateChatRequest
    {
        /// <summary>
        /// Nombre del chat que se desea crear, este campo es requerido.
        /// </summary>
        [Required]
        public string Name { get; set; }
        /// <summary>
        /// Identificador del proyecto al que se desea agregar el chat, este campo es requerido.
        /// </summary>
        [Required]
        public string ProjectId { get; set; }
        /// <summary>
        /// Lista con los identificadores de los miembros que se desea incluir en el chat, este campo es requerido pero la lista puede estar vacía.
        /// </summary>
        [Required]
        public List<string> Members { get; set; }
        /// <summary>
        /// Marca si un chat es un chat grupal o si es un chat entre pares, este campo por defecto tiene un valor verdadero.
        /// </summary>
        public bool IsGroup { get; set; } = true;
    }
}