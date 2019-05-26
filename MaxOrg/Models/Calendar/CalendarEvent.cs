using System;
using shortid;

namespace MaxOrg.Models.Calendar
{
    /// <summary>
    /// Representa a un evento en el calendario
    /// </summary>
    public class CalendarEvent
    {
        /// <summary>
        /// Identificador unico alfanúmerico del evento, consiste en una cadena de 15 digitos
        /// </summary>
        public string Id { get; set; } = ShortId.Generate(true, false, 15);
        /// <summary>
        /// Fecha de inicio del evento, es una fecha en formato UTC
        /// </summary>
        public DateTime Start { get; set; }
        /// <summary>
        /// Fecha de termino del evento, es una fecha en formato UTC
        /// </summary>
        public DateTime End { get; set; }
        /// <summary>
        /// Titulo/descripción del evento, es un parametro dado por el usuario para que sea facilmente identificable
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// Color del evento, el color indica la prioridad, solo es utilizada la parte primaria del mismo pero el modelo
        /// requiere primario y secundario
        /// </summary>
        public EventColor Color { get; set; }

        /// <summary>
        /// Identificador del usuario que creo el evento, solo el y el administrador pueden editarlo
        /// </summary>
        public string Creator { get; set; } = "";
    }
}