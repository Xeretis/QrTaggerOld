using backend.Data;
using backend.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Realtime;

public class ChatHub : Hub
{
    private readonly ApplicationDbContext _dbContext;

    public ChatHub(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Authorize("Both")]
    public async Task SendMessage(int tagId, string userId, string message)
    {
        var itemTag = await _dbContext.ItemTags.FindAsync(tagId);

        if (itemTag == null)
            return;

        var newMessage = new ChatMessage
        {
            Message = message,
            FromId = Context.UserIdentifier!,
            ToId = userId,
            TagId = tagId
        };

        _dbContext.ChatMessages.Add(newMessage);
        await _dbContext.SaveChangesAsync();

        await Clients.Users(userId).SendAsync("MessageReceived", message, Context.UserIdentifier);
    }
}