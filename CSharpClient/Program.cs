namespace CSharpClient
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");

            HttpClient httpClient = new();
            HttpRequestMessage request = new(HttpMethod.Get, "https://crusthack.com");

            var res = httpClient.Send(request);

            var s = res.Content.ReadAsStringAsync().Result;
            Console.WriteLine(s);
        }
    }
}
