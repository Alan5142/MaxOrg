using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MaxOrg.Requests.Chat
{
    public class SendMessageRequest
    {
        public string Message { get; set; }
    }

    public class AddUserToChatRequest
    {
        public string UserId { get; set; }
    }

    public class CreateChatRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string ProjectId { get; set; }
        [Required]
        public List<string> Members { get; set; }
        [Required]
        public bool IsGroup { get; set; }
    }
}