export interface ExtractedContext {
  nicheCore: string;
  audience: string;
  tone: string;
  contentType: string;
}

export function extractSignals(userWords: string): ExtractedContext {
  const words = (userWords || "").toLowerCase();

  // NICHE DETECTION
  let nicheCore = ""; 
  if (
    words.includes("travel") ||
    words.includes("trip") ||
    words.includes("explore") ||
    words.includes("adventure") ||
    words.includes("journey") ||
    words.includes("destination") ||
    words.includes("backpack") ||
    words.includes("world")
  ) {
    nicheCore = "travel";
  } else if (
    words.includes("food") ||
    words.includes("cook") ||
    words.includes("recipe") ||
    words.includes("bake") ||
    words.includes("eat") ||
    words.includes("kitchen") ||
    words.includes("meal") ||
    words.includes("cuisine") ||
    words.includes("dish")
  ) {
    nicheCore = "food";
  } else if (
    words.includes("money") ||
    words.includes("finance") ||
    words.includes("invest") ||
    words.includes("wealth") ||
    words.includes("budget") ||
    words.includes("saving") ||
    words.includes("coins") ||
    words.includes("stock") ||
    words.includes("crypto")
  ) {
    nicheCore = "finance";
  } else if (
    words.includes("fitness") ||
    words.includes("gym") ||
    words.includes("workout") ||
    words.includes("health") ||
    words.includes("exercise") ||
    words.includes("body") ||
    words.includes("weight") ||
    words.includes("muscle") ||
    words.includes("yoga")
  ) {
    nicheCore = "fitness";
  } else if (
    words.includes("game") ||
    words.includes("gaming") ||
    words.includes("play") ||
    words.includes("console") ||
    words.includes("esports") ||
    words.includes("stream") ||
    words.includes("retro") ||
    words.includes("pixel")
  ) {
    nicheCore = "gaming";
  } else if (
    words.includes("tech") ||
    words.includes("code") ||
    words.includes("ai") ||
    words.includes("software") ||
    words.includes("app") ||
    words.includes("digital") ||
    words.includes("computer") ||
    words.includes("developer") ||
    words.includes("gadget")
  ) {
    nicheCore = "tech";
  } else if (
    words.includes("beauty") ||
    words.includes("makeup") ||
    words.includes("skincare") ||
    words.includes("fashion") ||
    words.includes("style") ||
    words.includes("outfit") ||
    words.includes("glow") ||
    words.includes("hair")
  ) {
    nicheCore = "beauty";
  } else if (
    words.includes("learn") ||
    words.includes("study") ||
    words.includes("education") ||
    words.includes("book") ||
    words.includes("concept") ||
    words.includes("skill") ||
    words.includes("knowledge") ||
    words.includes("course")
  ) {
    nicheCore = "education";
  }

  // If no pre-programmed niche matched, dynamically extract the primary custom target word!
  if (!nicheCore) {
    const stopwords = new Set([
      "i", "want", "learn", "how", "share", "channel", "about", "videos", "my", "the", "a", "an", "and", "or", "but", 
      "for", "with", "this", "that", "you", "your", "ideas", "name", "expert", "best", "good", "great", "nice", "new", 
      "topic", "focus", "on", "in", "of", "to", "by", "from", "at", "as", "is", "are", "was", "were", "be", "been", "being", 
      "have", "has", "had", "do", "does", "did", "need", "give", "help", "please", "suggest", "create", "make", "vlog", "vlogs",
      "dedicated", "focused", "about", "covering", "content", "creator"
    ]);
    
    // Extract words greater than 2 letters, ignoring punctuation
    const rawCleaned = words.replace(/[^a-z\s]/g, "");
    const cleanWords = rawCleaned.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
    
    if (cleanWords.length > 0) {
      nicheCore = cleanWords[0]; // Take the most dominant custom noun
    } else {
      nicheCore = "general";
    }
  }

  // AUDIENCE DETECTION  
  let audience = "beginners"; // Default
  if (
    words.includes("student") ||
    words.includes("college") ||
    words.includes("university") ||
    words.includes("young") ||
    words.includes("teen") ||
    words.includes("youth")
  ) {
    audience = "students";
  } else if (
    words.includes("mom") ||
    words.includes("mother") ||
    words.includes("parent") ||
    words.includes("family") ||
    words.includes("kids") ||
    words.includes("child") ||
    words.includes("baby")
  ) {
    audience = "parents";
  } else if (
    words.includes("beginner") ||
    words.includes("starter") ||
    words.includes("new") ||
    words.includes("basic") ||
    words.includes("simple") ||
    words.includes("easy") ||
    words.includes("zero")
  ) {
    audience = "beginners";
  } else if (
    words.includes("gen-z") ||
    words.includes("young adult") ||
    words.includes("millennial") ||
    words.includes("creator")
  ) {
    audience = "young adults";
  } else if (
    words.includes("professional") ||
    words.includes("expert") ||
    words.includes("advanced") ||
    words.includes("serious")
  ) {
    audience = "professionals";
  }

  // TONE DETECTION
  let tone = "calm"; // Default
  if (
    words.includes("calm") ||
    words.includes("peaceful") ||
    words.includes("slow") ||
    words.includes("soothing") ||
    words.includes("relaxed") ||
    words.includes("cozy") ||
    words.includes("quiet")
  ) {
    tone = "calm";
  } else if (
    words.includes("bold") ||
    words.includes("intense") ||
    words.includes("fire") ||
    words.includes("energy") ||
    words.includes("powerful") ||
    words.includes("strong") ||
    words.includes("hustle")
  ) {
    tone = "bold";
  } else if (
    words.includes("fun") ||
    words.includes("funny") ||
    words.includes("laugh") ||
    words.includes("humor") ||
    words.includes("light") ||
    words.includes("casual") ||
    words.includes("easy")
  ) {
    tone = "fun";
  } else if (
    words.includes("motivate") ||
    words.includes("inspire") ||
    words.includes("growth") ||
    words.includes("uplift") ||
    words.includes("transform") ||
    words.includes("change")
  ) {
    tone = "motivational";
  } else if (
    words.includes("adventure") ||
    words.includes("wild") ||
    words.includes("explore") ||
    words.includes("raw") ||
    words.includes("rustic") ||
    words.includes("real") ||
    words.includes("authentic")
  ) {
    tone = "adventurous";
  }

  // CONTENT TYPE DETECTION
  let contentType = "tips"; // Default
  if (
    words.includes("tips") ||
    words.includes("tricks") ||
    words.includes("hacks") ||
    words.includes("advice") ||
    words.includes("guide") ||
    words.includes("how-to") ||
    words.includes("tutorial")
  ) {
    contentType = "tips";
  } else if (
    words.includes("vlog") ||
    words.includes("daily") ||
    words.includes("life") ||
    words.includes("behind") ||
    words.includes("personal") ||
    words.includes("journey") ||
    words.includes("diary")
  ) {
    contentType = "vlogs";
  } else if (
    words.includes("review") ||
    words.includes("compare") ||
    words.includes("honest") ||
    words.includes("opinion") ||
    words.includes("best") ||
    words.includes("worst") ||
    words.includes("ranking")
  ) {
    contentType = "reviews";
  } else if (
    words.includes("story") ||
    words.includes("stories") ||
    words.includes("narrative") ||
    words.includes("experience") ||
    words.includes("real") ||
    words.includes("truth")
  ) {
    contentType = "stories";
  }

  return { nicheCore, audience, tone, contentType };
}
