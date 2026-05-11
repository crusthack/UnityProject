namespace CSharpClient
{
    internal class WebClient
    {
        HttpClient _client;

        public WebClient()
        {
            _client = new();
        }

        public void SendLoginRequest()
        {

        }

        public bool SendHttpRequestMessage(HttpRequestMessage request)
        {
            return false;
        }
    }
}
