namespace MaxOrg.Models.Calendar
{
    /// <summary>
    /// Color a mostrar en el evento, se compone de un color primario y uno secundario
    /// </summary>
    public class EventColor
    {
        /// <summary>
        /// Color que se mostrará en el calendario, hay 3 colores distintos los cuales representan una prioridad distinta:
        ///
        /// Verde: Prioridad baja
        /// Azul: prioridad media
        /// Roja: prioridad alta
        ///
        /// La prioridad indica cuantos días antes se le empezará a enviar notificaciones al usuario
        /// </summary>
        public string Primary { get; set; }
        /// <summary>
        /// Campo no utilizado pero requerido por el modelo de frontend
        /// </summary>
        public string Secondary { get; set; }
    }
}