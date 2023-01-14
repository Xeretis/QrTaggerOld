using backend.Auth;
using backend.Data;
using backend.Realtime;
using backend.Services;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => { c.SwaggerDoc("v1", new OpenApiInfo { Title = "QrTagger", Version = "v1" }); });

builder.Services.Configure<MailSettings>(builder.Configuration.GetSection(nameof(MailSettings)));
builder.Services.AddTransient<IMailService, MailService>();
builder.Services.AddPersistence(builder.Configuration.GetConnectionString("DefaultConnection"));
builder.Services.AddAuth();

builder.Services.AddSignalR();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddMemoryCache();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(_ => { });

app.UseSpa(o => o.UseProxyToSpaDevelopmentServer("http://localhost:5173/"));

app.MapControllers();
app.MapHub<ChatHub>("/Hubs/Chat",
    o => { o.Transports = HttpTransportType.WebSockets | HttpTransportType.LongPolling; });

app.Run();