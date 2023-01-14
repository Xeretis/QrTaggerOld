namespace backend.Services;

public interface IMailService
{
    Task<bool> SendAsync(MailData mailData, CancellationToken ct);
}