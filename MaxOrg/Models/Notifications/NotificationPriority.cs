namespace MaxOrg.Models.Notifications
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
}