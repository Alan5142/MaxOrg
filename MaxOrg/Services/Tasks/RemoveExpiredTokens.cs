using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models;

namespace MaxOrg.Services.Tasks
{
    public class RemoveExpiredTokens : IScheduledTask
    {
        public string Schedule => "* */6 * * *";

        public Task ExecuteAsync(CancellationToken cancellationToken)
        {
            Task task = new Task(() =>
            {
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