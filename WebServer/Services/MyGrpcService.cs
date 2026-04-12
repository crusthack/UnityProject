using Grpc.Core;
using WebServer.Data;

namespace WebServer.Services
{
    public class MyGrpcService: Greeter.GreeterBase
    {
        private readonly ILogger<MyGrpcService> _logger;

        public MyGrpcService(ILogger<MyGrpcService> logger, AppDbContext context)
        {
            _logger = logger;
        }

        // .proto에서 정의한 rpc 메서드를 override하여 구현합니다.
        public override Task<HelloReply> SayHello(HelloRequest request, ServerCallContext context)
        {
            return Task.FromResult(new HelloReply
            {
                Message = "Hello " + request.Name
            });
        }
    }
}
