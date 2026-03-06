using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebServer.Data;
using WebServer.Models;
using System.Security.Cryptography;
using System.Linq;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace WebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _jwtKey;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _jwtKey = config["Jwt:Key"] ?? "change_this_to_a_secure_long_key";
        }
        public class SignupRequest
        {
            public string? UserID { get; set; }
            public string? Password { get; set; }
            public string? PasswordConfirm { get; set; }
        }

        public class LoginRequest
        {
            public string? UserID { get; set; }
            public string? Password { get; set; }
        }

        [HttpPost("signup")]
        public IActionResult Signup(SignupRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserID) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Invalid signup request");

            if (request.Password != request.PasswordConfirm)
                return BadRequest("Passwords do not match");

            // for Test api
            {
                if (request.UserID == "string")
                {
                    return Ok("signup api running well");
                }

                if (!TestCode(request))
                {
                    return BadRequest("Please use test credentials starting with 'test' for UserID and 'qwer' for Password");
                }
            }

            // check existing user
            if (_context.Users.Any(u => u.UserID == request.UserID))
                return Conflict("Username already exists");

            CreatePasswordHash(request.Password, out var hash, out var salt);

            var user = new User
            {
                UserID = request.UserID,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Signup successful" });
        }

        bool TestCode(SignupRequest request)
        {
            if (!request.UserID!.StartsWith("test"))
            {
                return false;
            }
            if (!request.Password!.StartsWith("qwer"))
            {
                return false;
            }

            return true;
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserID) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Invalid login request");

            var user = _context.Users.SingleOrDefault(u => u.UserID == request.UserID);
            if (user == null)
                return Unauthorized("Invalid username or password");

            if (!VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
                return Unauthorized("Invalid username or password");

            // Create JWT token
            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, user.UserNo.ToString()),
                new Claim(ClaimTypes.Name, user.UserID)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = creds
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { token = tokenString });
        }

        // --- Password helper methods ---
        private static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            salt = RandomNumberGenerator.GetBytes(16);
            // Use the static Pbkdf2 API to avoid obsolete constructors
            hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        }

        private static bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
        {
            var computed = Rfc2898DeriveBytes.Pbkdf2(password, storedSalt, 100_000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(computed, storedHash);
        }
    }
}
