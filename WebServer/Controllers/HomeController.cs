using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        [HttpGet("/")]
        public string Index()
        {
            return "hello, world!!";
        }

        [HttpPost("test")]
        public string Test(TestRequest request)
        {
            return $"test message: {request.testMessage}. testNum: {request.testNumber}";
        }
    }
}
