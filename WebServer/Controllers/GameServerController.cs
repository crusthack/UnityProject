using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace WebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameServerController : ControllerBase
    {
        static Dictionary<string, GameServerContext> gameServers { get; set; } = new();

        private readonly string _secretKey;
        public GameServerController(IConfiguration configuration)
        {
            _secretKey = configuration.GetValue<string>("Custom:SecretKey") ?? "DefaultKey";
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

            var ipAddress = HttpContext.Connection.RemoteIpAddress!.ToString();
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

        private bool IsGameServerAlive(string address, int portNum)
        {
            var uriBuilder = new UriBuilder("https", address, portNum, "api/Home/status");
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
                catch
                {
                    return false;
                }
            }

            return false;
        }
    }
}
