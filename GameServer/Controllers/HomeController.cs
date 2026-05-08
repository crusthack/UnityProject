using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace GameServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private string _secretKey;

        public HomeController(IConfiguration configuration)
        {
            _secretKey = configuration.GetValue<string>("Custom:SecretKey") ?? "DefaultKey";
        }
        [HttpGet("/")]
        public IActionResult Index()
        {
            return Ok("hello, world!!");
        }

        [HttpGet("status")]
        public IActionResult Status()
        {
            if(!IsAuthorized())
            {
                return BadRequest();
            }
            Console.WriteLine("Login Server checked me");


            return Ok("Game Server running well");
        }

        private bool IsAuthorized()
        {
            return Request.Headers["X-Secret-Key"] == _secretKey;
        }
    }
}
