using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using WebServer.Models;

namespace WebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameServerController : ControllerBase
    {
        static Dictionary<String, GameServerContext> gameServers { get; set; } = new();

        private readonly String _secretKey;
        private readonly bool _isLocalDev;
        public GameServerController(IConfiguration configuration, IWebHostEnvironment env)
        {
            _secretKey = configuration.GetValue<String>("Custom:SecretKey") ?? "DefaultKey";
            _isLocalDev = env.IsDevelopment();
        }
        private bool IsAuthorized()
        {
            return Request.Headers["X-Secret-Key"] == _secretKey;
        }

        [HttpGet]
        public IActionResult Get()
        {
            if (!IsAuthorized())
            {
                return Unauthorized();
            }

            return Ok("hello, gameserver");
        }

        public class GameServerContext
        {
            public required string ServerName { get; set; }
            public required string IpAddress { get; set; }
            public required int PortNum { get; set; }
            public required int Capacity { get; set; }
            public required int CurrentConnections { get; set; }
        }

        public class GameServerResponse
        {
            public required string ServerName { get; set; }
            public required string ServerAddress { get; set; }
            public required int ServerCapacity { get; set; }
            public required int CurrentConnections { get; set; }
        }

        //[Authorize]
        [HttpGet("ServerList")]
        public IActionResult ServerList()
        {
            RenewGameServerList();

            var response = gameServers.Values.Select(s => new GameServerResponse
            {
                ServerName = s.ServerName,
                ServerAddress = s.IpAddress + ":" + s.PortNum,
                ServerCapacity = s.Capacity,
                CurrentConnections = s.CurrentConnections,
            }).ToList();

            return Ok(response);
        }

        private void RenewGameServerList()
        {
            var keysToCheck = gameServers.Keys.ToList();

            foreach (var key in keysToCheck)
            {
                var server = gameServers[key];
                bool isAlive = IsGameServerAlive(server.IpAddress, server.PortNum);

                if (!isAlive)
                {
                    gameServers.Remove(key);
                }
            }
        }

        public class StatusRequest
        {
            public required string ServerName { get; set; }
            public required int PortNum { get; set; }
            public required int ServerCapacity { get; set; }
            public required int CurrentConnections { get; set; }
        }

        [HttpPost("Status")]
        public IActionResult UpdateStatus(StatusRequest request)
        {
            if (!IsAuthorized()) return Unauthorized();

            var ip = HttpContext.Connection.RemoteIpAddress!;
            var ipAddress = !_isLocalDev && IPAddress.IsLoopback(ip) ?
                    "crusthack.com" : IPAddress.IsLoopback(ip) ?
                    "localhost" : ip.ToString();

            Console.WriteLine(ipAddress);

            var portNum = request.PortNum;

            if (!IsGameServerAlive(ipAddress, portNum)) return BadRequest();

            if (gameServers.TryGetValue(request.ServerName, out var context))
            {
                // reject
            }
            else
            {
                var newContext = new GameServerContext
                {
                    ServerName = request.ServerName,
                    IpAddress = ipAddress,
                    PortNum = portNum,
                    Capacity = request.ServerCapacity,
                    CurrentConnections = request.CurrentConnections,
                };

                gameServers.Add(request.ServerName, newContext);
                Console.WriteLine($"New gameServer added {request.ServerName}");
            }

            return Ok();
        }

        public class GameServerConnectRequest
        {
            public required string GameServerName { get; set; }
        }
        public class ConnectRequestToGameServer
        {
            public required int UserNo { get; set; }
        }
        public class ConnectResponse
        {
            public required string ServerName { get; set; }
            public required string IpAddress { get; set; }
            public required int PortNum { get; set; }
            public required string ConnectionKey { get; set; }
        }

        [Authorize]
        [HttpPost("Connect")]
        public IActionResult RequestConnectionGameServer(GameServerConnectRequest request)
        {
            // 게임 서버 접속 요청을 받음 -> 해당 게임 서버에 접속 가능 확인 -> 응답 확인 후 접속 처리 
            // 로그인 서버가 게임 서버 측에 비밀키와 유저 아이디 넘김 -> 접속 가능 시 게임 서버가 해당 유저 아이디 기반 접속 키 발급 
            // 로그인 서버가 게임 서버 주소와 접속 키 넘김. 

            var uidClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(uidClaim))
                return Unauthorized();

            if (!int.TryParse(uidClaim, out var uid))
                return Unauthorized();

            if (!gameServers.TryGetValue(request.GameServerName, out var server) || server is null)
            {
                return BadRequest("목록에 없는 게임 서버입니다.");
            }

            var uriBuilder = new UriBuilder("https", server!.IpAddress, server.PortNum, "api/Home/connect");
            var req = new HttpRequestMessage(HttpMethod.Post, uriBuilder.Uri);
            req.Headers.Add("X-Secret-Key", _secretKey);
            Console.WriteLine(uid);

            var content = new ConnectRequestToGameServer
            {
                UserNo = uid
            };
            req.Content = JsonContent.Create(content);

            using (var client = new HttpClient())
            {
                try
                {
                    var a = client.Send(req);
                    if (a.IsSuccessStatusCode)
                    {
                        var data = new ConnectResponse
                        {
                            ServerName = server.ServerName,
                            IpAddress = server.IpAddress,
                            PortNum = server.PortNum,
                            ConnectionKey = "secretkey!!!"
                        };
                        return Ok(data);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                    return BadRequest("asd");
                }
            }

            return BadRequest("cdf");
        }


        private bool IsGameServerAlive(string address, int portNum)
        {
            var uriBuilder = new UriBuilder("https", address, portNum, "api/Home/status");
            Console.WriteLine(uriBuilder.Uri);
            var req = new HttpRequestMessage(HttpMethod.Get, uriBuilder.Uri);
            req.Headers.Add("X-Secret-Key", _secretKey);

            using (var client = new HttpClient())
            {
                try
                {
                    var a = client.Send(req);
                    if (a.IsSuccessStatusCode)
                    {
                        return true;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message);
                    return false;
                }
            }

            return false;
        }

    }
}
