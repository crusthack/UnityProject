using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameServerController : ControllerBase
    {
        private readonly string _secretKey;
        public GameServerController(IConfiguration configuration)
        {
            _secretKey = configuration.GetValue<string>("Custom:SecretKey") ?? "DefaultKey"; 
            
            Console.WriteLine(_secretKey);
            Console.WriteLine("!!!!!!!!!!!!!111");
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("hello, gameserver");
        }
    }
}
