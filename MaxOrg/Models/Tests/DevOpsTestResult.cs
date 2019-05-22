namespace MaxOrg.Models.Tests
{
    public class DevOpsTestResult
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int TotalTests { get; set; }
        public int PassedTests { get; set; }
        public string WebAccessUrl { get; set; }
    }
}