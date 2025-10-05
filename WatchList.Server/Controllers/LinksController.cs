using Microsoft.AspNetCore.Mvc;
using WatchList.Server.Services;

namespace WatchList.Server.Controllers
{
    public record Link(string Url);

    [ApiController]
    [Route("api/[controller]")]
    public class LinksController : ControllerBase
    {
        private readonly ILinksManager linksManager;

        public LinksController(ILinksManager linksManager)
        {
            this.linksManager = linksManager;
        }

        [HttpGet(Name = "GetLinks")]
        public IEnumerable<string> Get() => linksManager.GetAll();

        [HttpGet("check", Name = "CheckLink")]
        public ActionResult Check([FromQuery]string url) => linksManager.IsLinkExist(url)
            ? Ok(new { Status = "exists" })
            : Ok(new { Status = "not_found" });

        [HttpPost("check", Name = "CheckLink")]
        public ActionResult PostCheck([FromBody]Link link) => linksManager.IsLinkExist(link.Url)
            ? Ok(new { Status = "exists" })
            : Ok(new { Status = "not_found" });

        [HttpPost("add", Name = "AddLink")]
        public ActionResult Add([FromBody]Link link) => linksManager.AddLink(link.Url)
            ? Ok(new { Status = "saved" })
            : Ok(new { Status = "exists" });
    }
}
