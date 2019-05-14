using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models.Users;

namespace MaxOrg.Services.Tasks
{
    public class RemoveEmptyUsers : IScheduledTask
    {
        public string Schedule => "0 * * * *";

        public Task ExecuteAsync(CancellationToken cancellationToken)
        {
            var task = new Task(() =>
            {
                using (var db = ArangoDatabase.CreateWithSetting())
                {
                    db.Query<User>().Where(u => u.Username == null).Remove().Execute();
                }
            });
            task.Start();
            return task;
        }
    }
}