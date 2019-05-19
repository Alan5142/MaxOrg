using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Hubs;
using MaxOrg.Models;
using MaxOrg.Models.Group;
using MaxOrg.Models.Users;
using Microsoft.AspNetCore.SignalR;

namespace MaxOrg.Services.Tasks
{
    public class CheckCalendar : IScheduledTask
    {
        public string Schedule => "* */6 * * *";

        private IArangoDatabase Database { get; }
        private IHubContext<NotificationHub> NotificationHub { get; }

        public CheckCalendar(IArangoDatabase database, IHubContext<NotificationHub> notificationHub)
        {
            Database = database;
            NotificationHub = notificationHub;
        }

        public Task ExecuteAsync(CancellationToken cancellationToken)
        {
            var task = new Task(async () =>
            {
                var groups = await Database
                    .CreateStatement<Group>(
                        @"FOR g in Group
FILTER g.isRoot && g.events != [] && g.events != null
return {_key: g._key, _id: g._id, name: g.name, events: g.events}").ToListAsync();

                foreach (var group in groups)
                {
                    var users = await Database.CreateStatement<User>($@"FOR u in 1..1 INBOUND '{group.Id}'
 GRAPH 'GroupUsersGraph'
 return u").ToListAsync();
                    foreach (var @event in group.Events)
                    {
                        int threshold;
                        NotificationPriority priority;
                        switch (@event.Color.Primary)
                        {
                            case "#43a047": // baja prioridad
                                threshold = 1;
                                priority = NotificationPriority.Low;
                                break;
                            case "#d32f2f": // alta prioridad
                                threshold = 3;
                                priority = NotificationPriority.High;
                                break;
                            default: // media prioridad
                                threshold = 2;
                                priority = NotificationPriority.Medium;
                                break;
                        }

                        int remainingDays = (@event.Start.Date - DateTime.UtcNow.Date).Days;
                        if (@event.Start > DateTime.UtcNow && remainingDays <= threshold)
                        {
                            foreach (var u in users)
                            {
                                string message = remainingDays > 0
                                    ? $"Evento '{@event.Title}' empezará en {remainingDays} días" : $"Evento {@event.Title} empieza hoy";
                                var notification = new Notification
                                {
                                    Read = false,
                                    Message = message,
                                    Priority = priority,
                                    Context = $"project/{group.Key}"
                                };
                                u.Notifications.Add(notification);
                                await Database.UpdateByIdAsync<User>(u.Id, u);
                                await NotificationHub.Clients
                                    .Groups($"Users/{u.Key}")
                                    .SendAsync("notificationReceived", notification);
                            }
                        }

                        if ((@event.Start.Date - DateTime.UtcNow.Date).Days < 0 && (@event.End.Date - DateTime.UtcNow.Date).Days > 0)
                        {
                            foreach (var u in users)
                            {
                                string message = $"Evento {@event.Title} en curso";
                                var notification = new Notification
                                {
                                    Read = false,
                                    Message = message,
                                    Priority = priority,
                                    Context = $"project/{group.Key}"
                                };
                                u.Notifications.Add(notification);
                                await Database.UpdateByIdAsync<User>(u.Id, u);
                                await NotificationHub.Clients
                                    .Groups($"Users/{u.Key}")
                                    .SendAsync("notificationReceived", notification);
                            }
                        }
                    }
                }

                using (var db = ArangoDatabase.CreateWithSetting())
                {
                    var dateTimeNow = DateTime.UtcNow;
                    db.Query<RefreshToken>()
                        .Where(t => t.Expires <= dateTimeNow)
                        .Remove()
                        .Execute();
                }
            });
            task.Start();
            return task;
        }
    }
}