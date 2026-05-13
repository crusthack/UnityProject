namespace ClientConsole
{
    internal class Program
    {
        static void Main(string[] args)
        {
            var client = new WebClient();
            client.SendLoginRequest();
            client.SendGetAllUsererInfo();
        }
    }
}
