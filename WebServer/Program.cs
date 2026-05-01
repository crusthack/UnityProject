using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WebServer.Data;

namespace WebServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            // cors setting
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins(
                        "https://crusthack.github.io",
                        "http://localhost:3000"
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                    );
            });

            // 4. JWT 인증 설정
            //    - 대칭키 기반 서명(SymmetricSecurityKey)을 사용합니다.
            //    - 실제 서비스에서는 키를 환경변수나 비밀관리 시스템에 보관하세요.
            var jwtKey = builder.Configuration["Jwt:Key"] ?? "change_this_to_a_secure_long_key";
            var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // 개발 편의상 발급자/대상 검증을 비활성화했습니다.
                    // 운영 시에는 ValidateIssuer/ValidateAudience를 활성화하고 값을 설정하세요.
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ValidateLifetime = true
                };
            });

            builder.Services.AddAuthorization();
            // 5. EF Core DbContext 등록 (SQLite 사용)
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("app")));

            // 6. Swagger/OpenAPI 등록 (개발 편의용)
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            app.UseHttpsRedirection();

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<AppDbContext>(); // 사용자님의 DbContext 이름

                // 방법 A: 테이블이 없으면 생성 (가장 단순함)
                context.Database.EnsureCreated();
            }

            // 9. 개발 환경에서만 Swagger UI 활성화
            if (app.Environment.IsDevelopment())
            {
                // 8. 애플리케이션 시작 시 DB 생성 보장
                //    - EnsureCreated는 간단한 개발환경에서 사용 가능하지만, 운영에서는 EF 마이그레이션을 권장합니다.
                using (var scope = app.Services.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    db.Database.EnsureCreated();
                }

                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // 11. CORS 미들웨어 적용
            //     - 반드시 인증/인가 미들웨어 전에 실행되어야 프리플라이트 요청이 처리됩니다.
            app.UseCors("AllowFrontend");

            // 12. 인증/인가 미들웨어
            app.UseAuthentication();
            app.UseAuthorization();

            // 13. 라우팅된 컨트롤러 매핑
            app.MapControllers();

            app.Run();
        }
    }
}
