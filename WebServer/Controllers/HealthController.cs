using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace WebServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private static readonly DateTime _startTime = DateTime.UtcNow;

        [HttpGet]
        public IActionResult Get()
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();

            return Ok(new
            {
                status = "Healthy",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                serverTime = DateTime.UtcNow,
                uptime = DateTime.UtcNow - _startTime,
                details = new
                {
                    os = System.Runtime.InteropServices.RuntimeInformation.OSDescription,
                    framework = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription,
                    memoryUsageMb = process.WorkingSet64 / 1024 / 1024,
                    cpuCount = Environment.ProcessorCount
                }
            });
        }
    }
}
