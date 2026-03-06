using Microsoft.EntityFrameworkCore;
using WebServer.Models;

namespace WebServer.Data
{
    // 애플리케이션의 데이터베이스 컨텍스트입니다.
    // EF Core의 DbContext를 상속하여 DB 접근 및 모델 구성을 담당합니다.
    public class AppDbContext : DbContext
    {
        // 생성자
        // - ASP.NET Core의 DI(의존성 주입) 시스템이 제공하는
        //   DbContextOptions<AppDbContext>를 받아 베이스 DbContext에 전달합니다.
        // - 이 옵션에는 사용하는 DB 공급자(예: SQLite) 및 연결 문자열 등의 설정이 포함됩니다.
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSet<T> 프로퍼티는 데이터베이스의 테이블을 나타냅니다.
        // 예: public DbSet<User> Users -> 데이터베이스에 Users 테이블이 생성됩니다.
        // 컨트롤러나 서비스에서 이 DbSet을 통해 CRUD 작업을 수행합니다.
        public DbSet<User> Users { get; set; }

        // OnModelCreating
        // - 모델과 테이블 간 매핑 설정을 커스터마이징할 때 사용합니다.
        // - 인덱스, 제약조건, 관계(1:N, N:N) 설정, 초기 데이터 시딩 등을 여기서 정의할 수 있습니다.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 예시: User 엔터티의 Username 필드에 유니크 인덱스를 설정합니다.
            // 이렇게 하면 동일한 사용자명이 중복 저장되는 것을 DB 레벨에서 방지할 수 있습니다.
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserID)
                .IsUnique();

            // 추가 설정 예시(필요 시 활성화): 컬럼 이름, 길이 제한, 필수 여부 등
            // modelBuilder.Entity<User>()
            //     .Property(u => u.Username)
            //     .HasMaxLength(100)
            //     .IsRequired();
        }
    }
}
