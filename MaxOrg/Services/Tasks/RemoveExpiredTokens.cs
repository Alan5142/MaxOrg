using MaxOrg.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ArangoDB.Client;

namespace MaxOrg.Services.Tasks
{
    public class RemoveExpiredTokens : IScheduledTask
    {
        public string Schedule => "0 0 * * *";

        public Task ExecuteAsync(CancellationToken cancellationToken)
        {
            Task task = new Task(() =>
            {
                using (var db = ArangoDatabase.CreateWithSetting())
                {
                    var dateTimeNow = DateTime.Now;
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
