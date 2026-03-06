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
        [HttpGet("/")]
        public string Index()
        {
            return "hello, world!!";
        }

        [Authorize]
        [HttpGet("/profile")]
        public IActionResult Profile()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var name = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name);
            return Ok(new { uid = id, username = name });
        }
    }
}
