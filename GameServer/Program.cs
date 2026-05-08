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

            var app = builder.Build();

            // 서버 완전히 실행된 후 동작 
            app.Lifetime.ApplicationStarted.Register(() =>
            {
                GameServerContext.Init(builder.Configuration);
            });

            app.UseHttpsRedirection();

            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
