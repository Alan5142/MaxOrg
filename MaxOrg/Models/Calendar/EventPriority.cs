namespace MaxOrg.Models.Calendar
{
    /// <summary>
    /// Prioridad del evento, la prioridad indica la cantidad de días anteriores al evento en el que se empezará
    /// a enviar notificaciones
    /// </summary>
    public enum EventPriority
    {
        /// <summary>
        /// 1 día antes
        /// </summary>
        Low,
        /// <summary>
        /// 2 días antes
        /// </summary>
        Medium,
        /// <summary>
        /// 3 días antes
        /// </summary>
        High
    }
}