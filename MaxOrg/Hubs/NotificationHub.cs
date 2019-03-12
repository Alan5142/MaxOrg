using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MaxOrg.Hubs
{
    /// <summary>
    /// Hub de notificaciones, utiliza SignalR para la comunicación bidireccional en tiempo real entre los clientes y el
    /// servidor, 
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        /// <summary>
        /// Une a un determinado usuario a un grupo de notificaciones
        /// </summary>
        /// <param name="groupName"></param>
        /// <returns></returns>
        public async Task JoinNotificationGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Conecta a un usuario con los grupos a los que pertenece, de esta manera se suscribe a las notificaciones
        /// de los grupos a los que pertenece
        /// </summary>
        /// <returns>Nada cx</returns>
        public async Task ConnectToHub()
        {
            var name = Context.User.Identity.Name;
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName: "Users/" + name);
        }
    }
}