using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace ClientConsole
{
    internal class WebClient
    {
        private readonly HttpClient _client;
        private readonly string _url = "https://127.0.0.1:5001/api";
        private string? _jwt = null;

        public WebClient()
        {
            _client = new HttpClient();
        }

        public class LoginResponse
        {
            public required string Token { get; set; }
            public required string UserID { get; set; }
        }

        public void SendLoginRequest(string id, string password)
        {
            var loginData = new { userID = id, password = password };

            var res = _client.PostAsJsonAsync(_url + "/Auth/login", loginData).Result;

            if (res.IsSuccessStatusCode)
            {
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var loginRes = res.Content.ReadFromJsonAsync<LoginResponse>(options).Result;

                    Console.WriteLine($"Token: {loginRes?.Token}");
                    Console.WriteLine($"UserID: {loginRes?.UserID}");
                    _jwt = loginRes!.Token;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"역직렬화 실패: {ex.Message}");
                }
            }
            else
            {
                string errorDetail = res.Content.ReadAsStringAsync().Result;
                Console.WriteLine($"서버 에러 ({res.StatusCode}): {errorDetail}");
            }
        }

        public class EveryUserInfoResponse
        {
            public required int UserNo { get; set; }
            public required string UserID { get; set; }
            public required DateTime Created { get; set; }
            public required string Salt { get; set; }
        }
        public void SendGetAllUsersInfo()
        {
            if (_jwt == null) return;

            var req = new HttpRequestMessage(HttpMethod.Get, _url + "/User/everyuser");
            req.Headers.Add("Authorization", "Bearer " + _jwt);
            var res = _client.SendAsync(req).Result;

            if (res.IsSuccessStatusCode)
            {
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var loginRes = res.Content.ReadFromJsonAsync<EveryUserInfoResponse[]>(options).Result;

                    foreach (var user in loginRes!)
                    {
                        Console.WriteLine($"UserNo: {user.UserNo}, UserID: {user.UserID}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"역직렬화 실패: {ex.Message}");
                }
            }
            else
            {
                string errorDetail = res.Content.ReadAsStringAsync().Result;
                Console.WriteLine($"서버 에러 ({res.StatusCode}): {errorDetail}");
            }
        }

        public class GameServerInfo
        {
            public required string ServerName { get; set; }
            public required int ServerCapacity { get; set; }
            public required int CurrentConnections { get; set; }
        }
        public void GetAllGameServerList()
        {
            if (_jwt == null) return;

            var req = new HttpRequestMessage(HttpMethod.Get, _url + "/GameServer/ServerList");
            req.Headers.Add("Authorization", "Bearer " + _jwt);
            var res = _client.SendAsync(req).Result;

            if (res.IsSuccessStatusCode)
            {
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var serverList = res.Content.ReadFromJsonAsync<GameServerInfo[]>(options).Result;

                    foreach (var server in serverList!)
                    {
                        Console.WriteLine($"ServerName: {server.ServerName}, Capacity: {server.ServerCapacity}," +
                            $" CurrentCommections: {server.CurrentConnections}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"역직렬화 실패: {ex.Message}");
                }
            }
            else
            {
                string errorDetail = res.Content.ReadAsStringAsync().Result;
                Console.WriteLine($"서버 에러 ({res.StatusCode}): {errorDetail}");
            }
        }

        public class ConnectionResponse
        {
            public required string ServerName { get; set; }
            public required string IpAddress { get; set; }
            public required int PortNum { get; set; }
            public required string ConnectionKey { get; set; }
        }
        public void ConnectGameServer(string serverName)
        {
            if (_jwt == null) return;

            var data = new { GameServerName = serverName };
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _jwt);
            var res = _client.PostAsJsonAsync(_url + "/GameServer/Connect", data).Result;

            if (res.IsSuccessStatusCode)
            {
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var response = res.Content.ReadFromJsonAsync<ConnectionResponse>(options).Result;

                        Console.WriteLine($"ServerName: {response!.ServerName}, IpAddress: {response.IpAddress}," +
                            $" PortNum: {response.PortNum}, key: {response.ConnectionKey}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"역직렬화 실패: {ex.Message}");
                }
            }
            else
            {
                string errorDetail = res.Content.ReadAsStringAsync().Result;
                Console.WriteLine($"서버 에러 ({res.StatusCode}): {errorDetail}");
            }
        }
    }
}