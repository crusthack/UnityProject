namespace GameServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();

            var serverName = builder.Configuration["Custom:ServerName"];
            var serverCapa = builder.Configuration["Custom:ServerCapacity"];
            Console.WriteLine($"Server Name: {serverName}");
            Console.WriteLine($"Server Capacity: {serverCapa}");
            Console.WriteLine($"Login Server Address: {builder.Configuration["Custom:LoginServerURL"]}");

            GameServerContext.Init(builder.Configuration);  

            var app = builder.Build();

            app.UseHttpsRedirection();

            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
