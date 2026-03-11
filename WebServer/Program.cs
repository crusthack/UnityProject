using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WebServer.Data;

namespace WebServer
{
    // Program 클래스: 애플리케이션 진입점입니다.
    // - WebApplicationBuilder를 사용하여 서비스(의존성)들을 등록하고
    //   미들웨어 파이프라인을 구성한 뒤 앱을 실행합니다.
    public class Program
    {
        public static void Main(string[] args)
        {
            // 1. 빌더 생성: 설정, 로깅, DI 컨테이너 등을 포함
            var builder = WebApplication.CreateBuilder(args);

            // 2. 컨트롤러(웹 API) 서비스 등록
            //    - JSON 직렬화, 모델 바인딩, API 동작 등이 활성화됩니다.
            builder.Services.AddControllers();

            // 3. CORS 설정
            //    - 개발환경에서 프론트엔드(예: Next.js dev 서버)를 허용하기 위한 정책을 추가합니다.
            //    - production 환경에서는 구체적인 도메인만 허용하도록 변경하세요.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:3000")
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
            //    - connection string은 하드코딩되어 있으나 환경 설정으로 옮기는 것을 권장합니다.
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("app")));

            // 6. Swagger/OpenAPI 등록 (개발 편의용)
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            // 7. 애플리케이션 빌드
            var app = builder.Build();

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

            // 10. HTTPS 리디렉션
            //     - 개발 시 HTTPS가 설정되어 있다면 HTTP 요청을 HTTPS로 리디렉션합니다.
            app.UseHttpsRedirection();

            // 11. CORS 미들웨어 적용
            //     - 반드시 인증/인가 미들웨어 전에 실행되어야 프리플라이트 요청이 처리됩니다.
            app.UseCors("AllowFrontend");

            // 12. 인증/인가 미들웨어
            app.UseAuthentication();
            app.UseAuthorization();

            // 13. 라우팅된 컨트롤러 매핑
            app.MapControllers();

            // 14. 애플리케이션 실행
            app.Run();
        }
    }
}
