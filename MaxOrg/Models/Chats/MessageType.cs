namespace MaxOrg.Models.Chats
{
    /// <summary>
    /// Indica si un mensaje fue de texto, imágen, video o cualquier otro tipo de archivo
    /// </summary>
    public enum MessageType
    {
        /// <summary>
        /// El mensaje es de texto
        /// </summary>
        Text,
        /// <summary>
        /// El mensaje es una imágen
        /// </summary>
        Image,
        /// <summary>
        /// El mensaje es un video
        /// </summary>
        Video,
        /// <summary>
        /// El mensaje es de cualquier otro tipo de archivo
        /// </summary>
        Other
    }
}