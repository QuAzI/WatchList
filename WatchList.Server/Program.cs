using System.Text.Json;
using WatchList.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddScoped<ILinksManager, LinksManager>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true; // For development
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true; // Optional: Also lowercase query string parameters
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowExtension",
        policy =>
        {
            policy
                .AllowAnyMethod()
                .AllowAnyHeader()
                .WithOrigins("chrome-extension://*", "moz-extension://*")
                .SetIsOriginAllowed(origin => origin.StartsWith("chrome-extension://") || origin.StartsWith("moz-extension://"))
                ;
        });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowExtension");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
