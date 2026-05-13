using System.Net.Http.Json;
using System.Text.Json;

namespace ClientConsole
{
    internal class WebClient
    {
        private readonly HttpClient _client;
        private readonly string _url = "https://crusthack.com/api";
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

        public void SendLoginRequest()
        {
            var loginData = new { userID = "test1234", password = "qwer1234" };

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
        public void SendGetAllUsererInfo()
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
    }
}