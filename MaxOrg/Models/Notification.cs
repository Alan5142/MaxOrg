using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Threading.Tasks;
using ArangoDB.Client;
using shortid;

namespace MaxOrg.Models
{
    /// <summary>
    /// Prioridad de la notificación, es útil para considerar el color con el que se representará la notificación
    /// y para efecto de silenciar notificaciones de prioridades bajas
    /// </summary>
    public enum NotificationPriority
    {
        /// <summary>
        /// Notificación de prioridad baja
        /// </summary>
        Low,

        /// <summary>
        /// Notificación de prioridad media 
        /// </summary>
        Medium,

        /// <summary>
        /// Notificación de prioridad alta
        /// </summary>
        High
    }


    /// <summary>
    /// Representa una notificación en la base de datos, es utilizado por cualquier método que se encargue
    /// de crear notificaciones y también es utilizado por los métodos que se encargan de mandar la lista de notificaciones
    /// al usuario
    /// </summary>
    [CollectionProperty(Naming = NamingConvention.ToCamelCase)]
    public class Notification
    {
        /// <summary>
        /// Identificador unico de la notificación, es representado como un identificador alfanúmerico de 20 caracteres
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(useNumbers: true, useSpecial: false, 20);

        /// <summary>
        /// Mensaje de la notificación, es una cadena de texto con el mensaje de la notificación, incluye
        /// información del suceso de la notificación
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Contexto de la notificación, indica donde fue creada la notificación y crea un vinculo para que el usuario
        /// pueda acceder de manera sencilla al lugar donde se creo la notificación
        /// </summary>
        public string Context { get; set; }

        /// <summary>
        /// Fecha en la que se creo la notificación, se presenta al usuario para que tenga en cuenta cuando sucedio
        /// un evento determinado
        /// </summary>
        public DateTime TriggerDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Prioridad de la notificación, indica cual es la prioridad de la notificación, los posibles valores
        /// de este campo son: "High" que significa que la notificación tiene una prioridad alta y no se posible
        /// silenciarla, "Medium" que significa que la notificación tiene una prioridad media y es posible silenciarla
        /// si se especifica la opción de bloquear notificaciones de baja y media prioridad y "Low" que representa
        /// una notificación de prioridad baja, que es posible silenciarla con las opciones de "Solo notificaciones de alta
        /// y media prioridad" y "Solo notificaciones de alta prioridad"
        /// </summary>
        public NotificationPriority Priority { get; set; }

        /// <summary>
        /// Representa si la notificación fue leida
        /// </summary>
        public bool Read { get; set; }
    }
}
