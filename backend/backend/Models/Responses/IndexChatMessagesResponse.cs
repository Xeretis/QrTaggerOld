namespace backend.Models.Responses;

public class IndexChatMessagesResponse
{
    public string UserId { get; set; }
    public IEnumerable<IndexChatMessagesResponseMessage> Messages { get; set; }
}

public class IndexChatMessagesResponseMessage
{
    public string Message { get; set; }
    public bool Owned { get; set; }
    public DateTime CreatedAt { get; set; }
}