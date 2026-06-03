using Microsoft.EntityFrameworkCore;
using PimsApp.Data;
using System;
using System.Windows.Forms;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to run on local loopback on a random free port to prevent conflicts and firewall issues
builder.WebHost.UseUrls("http://127.0.0.1:0");

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register DbContext with InMemory (no database installation required)
builder.Services.AddDbContext<PimsDbContext>(options =>
    options.UseInMemoryDatabase("PimsDb"));

// Enable Session Support
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Register HttpContextAccessor to easily read session in Razor Views
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Auto-create in-memory database and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PimsDbContext>();
        context.Database.EnsureCreated();
        DbInitializer.Seed(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Disable HTTPS redirection for the local desktop app container
// app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Enable Session
app.UseSession();

app.UseAuthorization();

// Route directly to Dashboard/Index by default
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}");

// Run the web server in the background
await app.StartAsync();

// Retrieve the dynamically assigned local URL
var address = app.Urls.FirstOrDefault() ?? "http://127.0.0.1:5195";

// Run the Windows Forms application using our MainForm on a dedicated STA thread
var uiThread = new System.Threading.Thread(() =>
{
    ApplicationConfiguration.Initialize();
    Application.Run(new PimsApp.MainForm(app, address));
});
uiThread.SetApartmentState(System.Threading.ApartmentState.STA);
uiThread.Start();
uiThread.Join();

// Shut down the web server when the desktop window is closed
await app.StopAsync();
