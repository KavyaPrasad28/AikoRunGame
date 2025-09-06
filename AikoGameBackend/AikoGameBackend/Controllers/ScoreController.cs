using Microsoft.AspNetCore.Mvc;

namespace AikoGameBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScoreController : ControllerBase
    {
        private static int highScore = 0;

        [HttpGet]
        public IActionResult GetScore() => Ok(highScore);

        [HttpPost]
        public IActionResult PostScore([FromBody] ScoreDto data)
        {
            if (data.score > highScore) highScore = data.score;
            return Ok(highScore);
        }

    }
}
