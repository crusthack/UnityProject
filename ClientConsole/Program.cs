namespace ClientConsole
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.InputEncoding = System.Text.Encoding.UTF8;

            var client = new WebClient();
            PrintCommand();
            while (true)
            {
                var input = Console.ReadLine()?.Trim().ToLower() ?? "";
                if (String.IsNullOrEmpty(input))
                    continue;

                switch (input)
                {
                    case "s":
                        Console.Write("Input your id: ");
                        var id = Console.ReadLine();
                        Console.Write("Input your password: ");
                        var pw = Console.ReadLine();
                        if (String.IsNullOrEmpty(id) || String.IsNullOrEmpty(pw))
                            continue;
                        client.SendLoginRequest(id, pw);
                        break;

                    case "d":
                        client.SendLoginRequest("test1234", "qwer1234");
                        break;

                    case "a":
                        client.SendGetAllUsersInfo();
                        break;

                    case "g":
                        client.GetAllGameServerList();
                        break;
                    case "c":
                        Console.Write("Input server name to connect: ");
                        var target = Console.ReadLine() ?? "";
                        client.ConnectGameServer(target);
                        break;

                    default:
                        PrintCommand();
                        break;
                }
            }
        }

        static void PrintCommand()
        {
            Console.WriteLine("Command options:\n"
                + "s: PostLoginRequest\n"
                + "a: GetAllUserInfo\n" +
                "g: GetGameServerList" +
                "c: ConnectGameServer");
        }
    }
}
