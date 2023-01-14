using backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace backend.Auth;

public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User.GetMainId();
    }
}