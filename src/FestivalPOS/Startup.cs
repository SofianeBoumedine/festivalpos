using KajfestPOS.Controllers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Azure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Converters;

namespace KajfestPOS
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<PosOptions>(Configuration);

            services.AddMvc()
                .AddJsonOptions(options => options.SerializerSettings.Converters.Add(new StringEnumConverter(camelCaseText: true)));

            services.AddEntityFrameworkSqlServer()
                .AddDbContext<PosContext>();

            services.AddSignalR();

            services.AddSingleton(sp =>
            {
                var options = sp.GetRequiredService<IOptions<PosOptions>>().Value;
                return CloudStorageAccount.Parse(options.StorageConnectionString);
            });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IServiceScopeFactory serviceScopeFactory)
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<PosContext>();
                db.Database.Migrate();
            }

            if (env.IsDevelopment())
            {
                app
                    .UseDeveloperExceptionPage()
                    .UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions { HotModuleReplacement = true });
            }
            else
            {
                app.UseHsts();
            }

            app
                .UseStaticFiles()
                .UseSignalR(builder => builder.MapHub<AlarmsHub>("/alarms"))
                .UseMvc();
        }
    }
}
