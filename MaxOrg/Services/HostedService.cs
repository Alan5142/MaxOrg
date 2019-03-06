using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MaxOrg.Services
{
    public abstract class HostedService : IHostedService
    {
        private Task m_executingTask;
        private CancellationTokenSource m_cts;

        public Task StartAsync(CancellationToken cancellationToken)
        {
            m_cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

            m_executingTask = ExecuteAsync(m_cts.Token);

            return m_executingTask.IsCompleted ? m_executingTask : Task.CompletedTask;
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            if (m_executingTask == null)
            {
                return;
            }

            m_cts.Cancel();

            await Task.WhenAny(m_executingTask, Task.Delay(-1, cancellationToken));

            cancellationToken.ThrowIfCancellationRequested();
        }

        protected abstract Task ExecuteAsync(CancellationToken cancellationToken);
    }
}