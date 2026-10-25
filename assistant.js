import { formatPlaceNames, cheapestPrice, sortByLowestCrowd, sortByCheapest } from "./helpers";

export const INITIAL_MESSAGE = {
  sender: "bot",
  text: 'Hi! Tell me what kind of trip you\'re looking for — like "somewhere cold and quiet in June" — and I\'ll suggest a place from the list.',
};

export const ASSISTANT_FALLBACK =
  'I couldn\'t match that to anything in my list yet. Try asking things like "somewhere cold", "quiet beaches", "budget hill stations", or "places in South India".';

export function buildIntents(places) {
  const pickByCategory = (cat, n) =>
    sortByLowestCrowd(places.filter((p) => p.category === cat)).slice(0, n);

  const pickByRegion = (region, n) =>
    sortByLowestCrowd(places.filter((p) => p.region === region)).slice(0, n);

  return [
    {
      keywords: ["who are you", "are you ai", "are you real", "real ai", "just a bot", "gimmick"],
      respond: () =>
        "I'm TripWise's built-in trip matcher, not a real AI — I compare your message against a set of known trip questions and pull matching spots straight from our destination list.",
    },
    {
      keywords: ["hi", "hello", "hey", "yo"],
      respond: () =>
        "Hey! Tell me what you're after — cold, beach, desert, forest, quiet, budget, or a region like South India — and I'll match it to spots on TripWise.",
    },
    {
      keywords: ["thank", "thanks", "thankyou"],
      respond: () => "You're welcome — happy planning!",
    },
    {
      keywords: ["snow", "ski", "skiing"],
      respond: () => {
        let list = places.filter((p) => /snow/i.test(p.weather));
        list = sortByLowestCrowd(list.length ? list : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For snow, try " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["cold", "chilly", "winter", "himalaya"],
      respond: () => {
        let list = places.filter((p) => /cold/i.test(p.weather));
        list = sortByLowestCrowd(list.length ? list : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For a cold-weather trip, try " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["beach", "sea", "coast", "swim"],
      respond: () =>
        "For a coastal trip, try " +
        formatPlaceNames(pickByCategory("Beach", 3)) +
        " — good picks with lower crowds right now.",
    },
    {
      keywords: ["island", "andaman"],
      respond: () => "For island getaways, try " + formatPlaceNames(pickByRegion("Islands", 3)) + ".",
    },
    {
      keywords: ["desert", "dune", "arid", "rann"],
      respond: () => "For desert landscapes, try " + formatPlaceNames(pickByCategory("Desert", 3)) + ".",
    },
    {
      keywords: ["forest", "jungle", "wildlife", "tiger", "safari", "lion", "national park"],
      respond: () => "For forests and wildlife, try " + formatPlaceNames(pickByCategory("Forest", 3)) + ".",
    },
    {
      keywords: ["hill", "mountain", "trek", "hill station"],
      respond: () => "For hills and mountains, try " + formatPlaceNames(pickByCategory("Hill Station", 3)) + ".",
    },
    {
      keywords: ["quiet", "peaceful", "not crowded", "less crowd", "uncrowded", "empty", "calm"],
      respond: () =>
        "Right now the least-crowded spots on TripWise are " +
        formatPlaceNames(sortByLowestCrowd(places).slice(0, 3)) +
        ".",
    },
    {
      keywords: ["cheap", "budget", "affordable", "low cost", "inexpensive"],
      respond: () => {
        let list = sortByCheapest(places).slice(0, 3);
        return (
          "For a budget trip, try " +
          formatPlaceNames(list) +
          " — rooms start around ₹" +
          cheapestPrice(list[0]) +
          "/night there."
        );
      },
    },
    {
      keywords: ["north india", "north"],
      respond: () => "In North India, consider " + formatPlaceNames(pickByRegion("North", 3)) + ".",
    },
    {
      keywords: ["south india", "south"],
      respond: () => "In South India, consider " + formatPlaceNames(pickByRegion("South", 3)) + ".",
    },
    {
      keywords: ["east india", "east"],
      respond: () => "In East India, consider " + formatPlaceNames(pickByRegion("East", 3)) + ".",
    },
    {
      keywords: ["west india", "west"],
      respond: () => "In West India, consider " + formatPlaceNames(pickByRegion("West", 3)) + ".",
    },
    {
      keywords: ["northeast"],
      respond: () => "In Northeast India, consider " + formatPlaceNames(pickByRegion("Northeast", 3)) + ".",
    },
    {
      keywords: ["family", "kids", "children"],
      respond: () =>
        "For a family trip, calmer, lower-crowd spots tend to work best — try " +
        formatPlaceNames(sortByLowestCrowd(places).slice(0, 3)) +
        ".",
    },
    {
      keywords: ["honeymoon", "romantic", "couple"],
      respond: () =>
        "For a romantic trip, try " +
        formatPlaceNames(pickByCategory("Hill Station", 2).concat(pickByCategory("Beach", 1))) +
        ".",
    },
    {
      keywords: ["weekend trip", "weekend", "short trip", "quick getaway", "2 days", "3 days"],
      respond: () =>
        "For a quick weekend getaway, accessible scenic spots like " +
        formatPlaceNames(sortByLowestCrowd(pickByCategory("Hill Station", 2).concat(pickByCategory("Beach", 2))).slice(0, 3)) +
        " are great choices.",
    },
    {
      keywords: ["long trip", "one week", "extended trip", "long vacation", "week long"],
      respond: () =>
        "For an extended vacation or week-long journey, immersive destinations like " +
        formatPlaceNames(sortByLowestCrowd(places.filter((p) => ["North", "Northeast", "South"].includes(p.region))).slice(0, 3)) +
        " offer plenty to explore.",
    },
    {
      keywords: ["solo trip", "traveling alone", "backpacking", "solo", "backpacker", "solo travel"],
      respond: () => {
        let soloSpots = places.filter((p) => [5, 3, 19, 37, 41, 1].includes(p.id));
        let list = sortByLowestCrowd(soloSpots.length ? soloSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For solo travel and backpacking, vibrant and traveler-friendly spots like " + formatPlaceNames(list) + " are top favorites.";
      },
    },
    {
      keywords: ["trekking", "adventure", "camping", "rafting", "paragliding", "hike", "hiking", "trek"],
      respond: () => {
        let adventureSpots = places.filter((p) => [9, 13, 1, 4, 5, 16].includes(p.id));
        let list = sortByLowestCrowd(adventureSpots.length ? adventureSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For thrill-seekers and adventure activities like rafting, skiing, or trekking, check out " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["monsoon", "rainy season", "rain", "mist", "monsoons", "raining"],
      respond: () => {
        let monsoonSpots = places.filter((p) => [25, 31, 34, 50, 51].includes(p.id));
        let list = sortByLowestCrowd(monsoonSpots.length ? monsoonSpots : places.filter((p) => p.category === "Forest" || p.category === "Hill Station")).slice(0, 3);
        return "During the monsoons, misty waterfalls and lush green hills come alive in places like " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["summer", "hot weather escape", "beat the heat", "hot summer", "escape heat"],
      respond: () => {
        let coldSpots = places.filter((p) => /cold/i.test(p.weather) || /cool/i.test(p.weather));
        let list = sortByLowestCrowd(coldSpots.length ? coldSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "To escape the summer heat, cool mountain retreats like " + formatPlaceNames(list) + " are ideal.";
      },
    },
    {
      keywords: ["photography", "scenic", "instagram", "views", "photo", "photogenic", "picturesque", "viewpoint"],
      respond: () => {
        let scenicSpots = places.filter((p) => [4, 15, 20, 28, 31, 37, 39, 58].includes(p.id));
        let list = sortByLowestCrowd(scenicSpots.length ? scenicSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For incredible photography and dramatic scenic views, you can't beat " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["wildlife", "safari", "tiger", "lion", "rhino", "animals", "national park", "jungle safari"],
      respond: () => {
        let wildlifeSpots = places.filter((p) => [29, 38, 47, 54, 62].includes(p.id));
        let list = sortByLowestCrowd(wildlifeSpots.length ? wildlifeSpots : pickByCategory("Forest", 3)).slice(0, 3);
        return "For wildlife safaris and spotting tigers, lions, or rhinos, head to " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["heritage", "historical", "fort", "temple", "ruins", "monuments", "history", "palace", "architecture"],
      respond: () => {
        let heritageSpots = places.filter((p) => [18, 19, 22, 27, 39, 40, 49, 60].includes(p.id));
        let list = sortByLowestCrowd(heritageSpots.length ? heritageSpots : pickByCategory("Plains", 3)).slice(0, 3);
        return "For rich heritage, centuries-old forts, and ancient temple architecture, consider visiting " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["nightlife", "party", "clubs", "night out", "evening vibe", "clubbing"],
      respond: () => {
        let partySpots = places.filter((p) => [63, 24, 21, 5, 41].includes(p.id));
        let list = partySpots.length ? partySpots.slice(0, 3) : pickByCategory("Beach", 2);
        return "For lively nightlife, beach shacks, and evening entertainment, " + formatPlaceNames(list) + " are the top destinations.";
      },
    },
    {
      keywords: ["road trip", "driving", "self-drive", "drive", "scenic drive", "roadtrip"],
      respond: () => {
        let roadSpots = places.filter((p) => [1, 4, 14, 25, 34, 44].includes(p.id));
        let list = sortByLowestCrowd(roadSpots.length ? roadSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For unforgettable road trips and scenic highway routes, destinations like " + formatPlaceNames(list) + " provide thrilling drives.";
      },
    },
  ];
}

export function matchAssistantIntent(userQuestion, intents) {
  let q = userQuestion.toLowerCase();
  let best = null;
  let bestScore = 0;

  intents.forEach((intent) => {
    let score = intent.keywords.filter((kw) => q.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  });

  return best;
}

export async function askTripAssistant(userQuestion, places) {
  await new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 350));

  let intents = buildIntents(places);
  let intent = matchAssistantIntent(userQuestion, intents);
  if (!intent) return ASSISTANT_FALLBACK;

  try {
    return intent.respond();
  } catch (e) {
    return ASSISTANT_FALLBACK;
  }
}