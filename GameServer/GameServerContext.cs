using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace GameServer
{
    // 로그인 서버에 서버 정보 알리기 위한 클래스 
    public class GameServerContext
    {
        static private GameServerContext? _instance;

        private readonly string _serverName;
        private readonly int _serverCapacity;
        private readonly int _serverPort;

        private readonly string _loginURL;
        private readonly HttpClient _client;

        private readonly string _secretKey;

        public int CurrentConnectionCount { get; set; }


        private GameServerContext(IConfiguration configuration)
        {
            _serverName = configuration["Custom:ServerName"] ?? "";
            _serverCapacity = Int32.Parse(configuration["Custom:ServerCapacity"] ?? "0");
            var loginUrl = configuration["Custom:LoginServerURL"] ?? "";
            var secretKey = configuration["Custom:SecretKey"] ?? "";

            string fullAddress = configuration["Kestrel:Endpoints:Https:Url"] ?? "";
            var uri = new Uri(fullAddress);

            this._serverPort = uri.Port;

            _client = new HttpClient();

            if (string.IsNullOrEmpty(_serverName))
            {
                Console.WriteLine("Server Name is empty");
                throw (new Exception("Please input server name"));
            }

            CurrentConnectionCount = 0;


            _loginURL = loginUrl;
            _client = new HttpClient();

            _secretKey = secretKey;
        }

        static public GameServerContext Init(IConfiguration configuration)
        {
            _instance = new GameServerContext(configuration);
            _instance.Test();
            SendServerStatus();

            return _instance;
        }

        private void Test()
        {
            if (_instance == null) return;

            var req = new HttpRequestMessage(HttpMethod.Get, _loginURL);
            req.Headers.Add("X-Secret-Key", _secretKey);

            _ = _instance.SendRequest(req);
        }

        public class StatusData
        {
            public required string ServerName { get; set; }
            public required int PortNum { get; set; }
            public required int ServerCapacity { get; set; }
            public required int CurrentConnections { get; set; }
        }

        public static void SendServerStatus()
        {
            if (_instance == null) return;

            var req = new HttpRequestMessage(HttpMethod.Post, _instance._loginURL + "/api/gameserver/status");
            req.Headers.Add("X-Secret-Key", _instance._secretKey);
                
            var data = new StatusData                       
            {
                ServerName = _instance._serverName,
                PortNum = _instance._serverPort,
                ServerCapacity = _instance._serverCapacity,
                CurrentConnections = _instance.CurrentConnectionCount
            };

            req.Content = JsonContent.Create(data);

            _ = _instance.SendRequest(req);
            Console.WriteLine("Status message sent successfully.");
        }


        private async Task SendRequest(HttpRequestMessage request)
        {
            try
            {
                var res = await _client.SendAsync(request);
                if (res.IsSuccessStatusCode)
                {
                    Console.WriteLine("Message sent successfully.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending message: {ex.Message}");
            }
        }
    }
}
