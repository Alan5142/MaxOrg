using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Models.Kanban
{
    /// <summary>
    /// Petición para cambiar de posición una tarjeta entre una sección y otra, es utilizado por el método "SwapCards"
    /// del controlador de grupos
    /// </summary>
    public class SwapCardsRequest
    {
        /// <summary>
        /// Posición en la que se encontraba anteriormente la tarjeta
        /// </summary>
        [Required]
        public int PreviousIndex { get; set; }
        /// <summary>
        /// Posición en la que se modificará la tarjeta
        /// </summary>
        [Required]
        public int NewIndex { get; set; }
    }
}