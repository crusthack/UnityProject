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
            
            // API 컨트롤러 사용 설정
            builder.Services.AddControllers();

            // cors 제외 설정
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins(
                        "https://crusthack.github.io",
                        "http://localhost:3000",
                        "http://localhost:3001"
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                    );
            });

            // JWT 인증 설정
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

            // 6. Swagger 등록
            if (builder.Environment.IsDevelopment())
            {
                // 개발 환경일 때만 API 명세 서비스를 준비합니다.
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();
            }


            // 앱 설정 
            var app = builder.Build();

            // HTTP요청 HTTPS로 리다이렉션
            app.UseHttpsRedirection();

            // db 설정
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<AppDbContext>();

                // 테이블이 없으면 생성
                context.Database.EnsureCreated();
            }

            // 개발 환경 체크
            if (app.Environment.IsDevelopment())
            {
                // swagger 사용 설정 
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // cors 설정 
            app.UseCors("AllowFrontend");

            // 인증/인가 미들웨어
            app.UseAuthentication();
            app.UseAuthorization();

            // 컨트롤러 매핑 
            app.MapControllers();

            app.Run();
        }
    }
}
