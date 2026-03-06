using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using WebServer.Data;
using WebServer.Models;

namespace WebServer.Controllers
{
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
        // JWT로 인증된 사용자만 접근할 수 있도록 [Authorize]를 사용합니다.
        // 응답에는 비밀번호 관련 필드를 포함하지 않습니다.
        [Authorize]
        [HttpGet("info")]
        public IActionResult GetCurrentUser()
        {
            // 토큰에 저장한 NameIdentifier 클레임(UID)을 읽습니다.
            var uidClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(uidClaim))
                return Unauthorized();

            if (!int.TryParse(uidClaim, out var uid))
                return Unauthorized();

            var user = _context.Users.Find(uid);
            if (user == null)
                return NotFound();

            // 사용자명만 반환 (민감 데이터 제외)
            return Ok(new { uid = user.UserNo, username = user.UserID });
        }
    }
}
