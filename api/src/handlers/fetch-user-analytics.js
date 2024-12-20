import { fetchLichessUserGames } from "../core/lichess/export-games.js";
import { fetchLichessUserPerformanceStatistics } from "../core/lichess/performance-statistics.js";
import corsHeaders from "./cors-headers.js";
import { fetchLichessUserRatingHistory } from "../core/lichess/user-rating-history.js";
import { fetchAnalytics } from "../core/chesscom/fetch-analytics.js";

export async function fetchUserAnalytics(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const { platform, username, colour, gameType } = event.queryStringParameters;

  if (platform === "lichess") {
    const authorisation = event.headers?.Authorization;
    if (!authorisation) {
      return {
        statusCode: 401,
        headers: corsHeaders,
      };
    }

    // Cannot be parallelised as Lichess allows only one request at a time
    const games = await fetchLichessUserGames(authorisation, username, gameType, colour);
    const performance = await fetchLichessUserPerformanceStatistics(authorisation, username, gameType);
    const latestPuzzleRating = await fetchLichessUserRatingHistory(authorisation, username, "Puzzles");

    if (!games || !performance) {
      return {
        statusCode: 404,
        headers: corsHeaders,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ performance, games, latestPuzzleRating }),
      headers: corsHeaders,
    };
  } else if (platform === "chesscom") {
    return {
      statusCode: 200,
      body: JSON.stringify(await fetchAnalytics(username, gameType, colour)),
      headers: corsHeaders,
    };
  }
}
