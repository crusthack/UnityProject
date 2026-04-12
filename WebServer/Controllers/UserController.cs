using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WebServer.Data;
using WebServer.Models;

namespace WebServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // 현재 인증된 사용자 정보를 반환합니다.
        [HttpGet("info")]
        public IActionResult GetCurrentUser()
        {
            // 토큰에 저장한 NameIdentifier 클레임(UID)을 읽습니다.
            var uidClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(uidClaim))
                return Unauthorized();

            if (!int.TryParse(uidClaim, out var uid))
                return Unauthorized();

            var u = _context.Users.Find(uid);
            if (u == null)
                return NotFound();

            return Ok(new
            {
                u.UserNo,
                UserID = u.UserID,
                Created = u.CreatedAt,
                Salt = u.PasswordSalt,
            });
        }

        [HttpGet("everyuser")]
        public IActionResult GetEveryUserInfo()
        {
            var users = _context.Users
                    .Select(u => new
                    {
                        u.UserNo,
                        UserID = u.UserID,
                        Created = u.CreatedAt,
                        Salt = u.PasswordSalt,
                    })
                    .ToList();

            return Ok(users);
        }
    }
}
