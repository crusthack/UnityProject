using Microsoft.AspNetCore.Mvc;

namespace WebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        public class TestRequest
        {
            public required string testMessage { get; set; }
            public required int testNumber { get; set; }
        }

        // /로 시작하면 절대 경로 지정임. 
        [HttpGet("/")]
        public string Index()
        {
            return "hello, world!!!";
        }

        [HttpPost("test")]
        public string Test(TestRequest request)
        {
            return $"test message: {request.testMessage}. testNum: {request.testNumber}";
        }
    }
}