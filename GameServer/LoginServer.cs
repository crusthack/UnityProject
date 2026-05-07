namespace GameServer
{
    // 로그인 서버에 서버 정보 알리기 위한 클래스 
    public class LoginServer
    {
        static private LoginServer? _instance;

        private readonly string _loginURL;
        private readonly HttpClient _client;

        private LoginServer(string loginURL)
        {
            _loginURL = loginURL;
            _client = new HttpClient();
        }

        static public LoginServer Init(string loginURL)
        {
            _instance = new LoginServer(loginURL);
            _instance.Test();

            return _instance;
        }

        private async void Test()
        {
            var res = _client.Send(new HttpRequestMessage(HttpMethod.Get, _loginURL));
            Console.WriteLine($"Check Login Server alive: {await res.Content.ReadAsStringAsync()}");
        }

        public static void SendInitMessage()
        {

        }

        public static void SendServerStatus()
        {

        }
    }
}
