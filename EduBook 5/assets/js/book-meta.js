// EduBook — book-meta.js
// Since the current book dataset has no edition/publisher/rating/review fields
// (see README: books only carry title, author, category, isbn, price,
// discountPrice, status, coverColors), this module deterministically derives
// presentable values for the Book Details page from each book's own id/title —
// same book always shows the same rating/reviews/edition, no backend needed.
// Swap generateReviews()/getPublisherAndEdition() for real API calls once you
// have a reviews table — every call site only depends on the shape returned here.
(function (global) {

  function hashSeed(str) {
    var h = 2166136261;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var PUBLISHERS = {
    'computer': ['Pearson Education', 'McGraw Hill Education', 'Wiley India'],
    'electronics': ['Khanna Publishers', 'PHI Learning', 'S. Chand Publishing'],
    'electrical': ['PHI Learning', 'S. Chand Publishing', 'Khanna Publishers'],
    'mechanical': ['S. Chand Publishing', 'Khanna Publishers', 'PHI Learning'],
    'civil': ['S. Chand Publishing', 'Khanna Publishers', 'PHI Learning'],
    'management': ['Tata McGraw-Hill', 'Sage Publications', 'Pearson Education'],
    'mba': ['Tata McGraw-Hill', 'Sage Publications', 'Pearson Education'],
    'economics': ['Sage Publications', 'Oxford University Press'],
    'default': ['Oxford University Press', 'Cambridge University Press', 'Pearson Education']
  };
  var EDITIONS = ['1st Edition', '2nd Edition', '3rd Edition', '4th Edition', 'Revised Edition'];

  function pick(list, rand) { return list[Math.floor(rand() * list.length)]; }

  function getPublisherAndEdition(book) {
    var rand = mulberry32(hashSeed(book.id + '|meta'));
    var cat = String(book.category || '').toLowerCase();
    var key = Object.keys(PUBLISHERS).find(function (k) { return cat.indexOf(k) !== -1; }) || 'default';
    var publisher = pick(PUBLISHERS[key], rand);
    var edition = pick(EDITIONS, rand);
    var year = 2016 + Math.floor(rand() * 9); // 2016–2024
    return { publisher: publisher, edition: edition + ' (' + year + ')' };
  }

  var COMMENTS = {
    5: ['Excellent condition, exactly as described!', 'Great price for a used book, highly recommend.',
        'Fast reply from the seller, book arrived in great shape.', 'Perfect for my semester, saved me a lot of money.',
        'Really happy with this purchase, would buy again.'],
    4: ['Good book overall, minor wear on the cover.', 'Solid buy, a few highlighted pages but nothing major.',
        'Would buy from this seller again.', 'Content is exactly what I needed for my course.'],
    3: ['Book is okay, more worn than expected.', 'Decent but took a while to arrive.', 'Average condition for the price.'],
    2: ['Cover was more damaged than the listing suggested.', 'A few pages were torn, otherwise readable.'],
    1: ['Not as described, quite disappointed.', 'Missing a few pages.']
  };
  var FIRST_NAMES = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Karthik', 'Divya', 'Arjun', 'Meera', 'Rahul', 'Isha'];
  var LAST_INITIALS = ['S.', 'K.', 'R.', 'M.', 'P.', 'N.', 'V.', 'D.'];

  function distributionForAverage(avg) {
    if (avg >= 4.5) return [60, 25, 8, 4, 3];
    if (avg >= 4.0) return [45, 30, 15, 6, 4];
    if (avg >= 3.5) return [30, 30, 20, 12, 8];
    return [18, 22, 25, 20, 15];
  }

  function getRatingData(book) {
    var rand = mulberry32(hashSeed(book.id + '|rating'));
    var avg = Math.round((3.4 + rand() * 1.5) * 10) / 10;
    if (avg > 5) avg = 5;
    var total = Math.floor(8 + rand() * 130);

    var basePct = distributionForAverage(avg);
    var jittered = basePct.map(function (p) { return Math.max(1, p + (rand() * 8 - 4)); });
    var sum = jittered.reduce(function (a, b) { return a + b; }, 0);
    var counts = jittered.map(function (p) { return Math.round((p / sum) * total); });
    // fix rounding drift onto the largest bucket
    var diff = total - counts.reduce(function (a, b) { return a + b; }, 0);
    var maxIdx = counts.indexOf(Math.max.apply(null, counts));
    counts[maxIdx] += diff;

    var distribution = { 5: counts[0], 4: counts[1], 3: counts[2], 2: counts[3], 1: counts[4] };

    var reviewCount = Math.min(5, total);
    var reviews = [];
    var starPool = [];
    [5, 4, 3, 2, 1].forEach(function (star) {
      for (var i = 0; i < distribution[star]; i++) starPool.push(star);
    });
    for (var i = 0; i < reviewCount; i++) {
      var idx = Math.floor(rand() * starPool.length);
      var star = starPool.splice(idx, 1)[0] || 5;
      var name = pick(FIRST_NAMES, rand) + ' ' + pick(LAST_INITIALS, rand);
      var comment = pick(COMMENTS[star] || COMMENTS[3], rand);
      var daysAgo = Math.floor(3 + rand() * 150);
      reviews.push({ name: name, star: star, comment: comment, daysAgo: daysAgo });
    }
    reviews.sort(function (a, b) { return a.daysAgo - b.daysAgo; });

    return { average: avg, total: total, distribution: distribution, reviews: reviews };
  }

  global.BookMeta = { getPublisherAndEdition: getPublisherAndEdition, getRatingData: getRatingData };
})(window);
