namespace MaxOrg.Models.Users
{
    public class UsersQueryOptions
    {
        public string Name { get; set; }
        public bool? Sorted { get; set; }
        public int? Limit { get; set; }
        public int? Page { get; set; }
        public string Email { get; set; }
        public int? MaxElements { get; set; }
    }
}