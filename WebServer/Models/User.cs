using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebServer.Models
{
    public class User
    {
        // 기본 키로 사용할 속성입니다. EF Core가 기본 키를 알아야 트래킹 및 저장이 정상 동작합니다.
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserNo { get; set; }
        public required string UserID { get; set; }

        // PasswordHash and PasswordSalt store the user's password securely using PBKDF2.
        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }

        // (Optional) track when the user was created
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
