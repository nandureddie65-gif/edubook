// EduBook — books-data.js
// Sample in-memory book data (per README: no backend `books` table yet).
// Every book: { id, title, author, category, isbn, price, discountPrice,
// status, coverColors }. coverColors is a 2-stop gradient used as the
// underlying placeholder background for every cover, in case a real cover
// photo isn't available for that ISBN.

// ---------------------------------------------------------------------------
// Real cover photos, looked up by ISBN. Every book in this app carries a
// real, published ISBN, so rather than hand-hosting cover image files we
// resolve a cover at render time from public, no-auth-required cover APIs —
// trying Open Library first, then Google Books — so essentially every
// textbook (not just some) ends up with a real photographed cover. The
// gradient in `coverColors` only shows through if *both* sources 404 for
// that particular edition, so it still acts as a safety net rather than
// the default look.
function coverImageSources(isbn) {
  var clean = String(isbn || '').replace(/[^0-9Xx]/g, '');
  if (!clean) return [];
  return [
    'https://covers.openlibrary.org/b/isbn/' + clean + '-L.jpg',
    'https://books.google.com/books/content?vid=ISBN' + clean + '&printsec=frontcover&img=1&zoom=1&source=gbs_api'
  ];
}
// Builds a cover <img> that walks through coverImageSources() on error and,
// once every source has failed, removes itself so the gradient placeholder
// underneath shows through untouched. `size` is kept for callers that used
// to pass an Open Library size letter (S/M/L) — it no longer changes which
// endpoint is used (the -L size looks best at every card size on screen)
// but is still accepted so existing call sites don't need to change.
function coverImgTag(isbn, size, altText) {
  var sources = coverImageSources(isbn);
  if (!sources.length) return '';
  var alt = String(altText || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
  return '<img class="cover-img" src="' + sources[0] + '" data-cover-fallback="' + sources.slice(1).join(',') + '"' +
    ' alt="' + alt + '" loading="lazy" onerror="window.__coverImgError(this)">';
}
// Shared onerror handler (kept on window so it works from markup built as
// plain HTML strings, not just from code that has this closure in scope).
window.__coverImgError = function (img) {
  var remaining = (img.getAttribute('data-cover-fallback') || '').split(',').filter(Boolean);
  var next = remaining.shift();
  if (next) {
    img.setAttribute('data-cover-fallback', remaining.join(','));
    img.src = next;
  } else {
    img.remove();
  }
};

const CATALOG_BOOKS = [
  { id: 'c-01', title: 'Engineering Mathematics I', author: 'B.S. Grewal', category: 'Computer Science', isbn: '9788193328491', price: 450, discountPrice: 380, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-02', title: 'Data Structures Using C', author: 'Reema Thareja', category: 'Computer Science', isbn: '9780198099307', price: 520, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-03', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Computer Science', isbn: '9780132126953', price: 650, discountPrice: 540, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-04', title: 'Operating System Concepts', author: 'Abraham Silberschatz', category: 'Computer Science', isbn: '9781118063330', price: 700, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-05', title: 'Database Management Systems', author: 'Raghu Ramakrishnan', category: 'Computer Science', isbn: '9780072465631', price: 610, discountPrice: 500, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-06', title: 'Digital Logic Design', author: 'Morris Mano', category: 'Electronics', isbn: '9780132774208', price: 420, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-07', title: 'Electronic Devices and Circuits', author: 'Boylestad', category: 'Electronics', isbn: '9780133923605', price: 480, discountPrice: 410, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-08', title: 'Analog Communication', author: 'Simon Haykin', category: 'Electronics', isbn: '9780471697909', price: 560, discountPrice: null, status: 'Sold', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-09', title: 'Microprocessors and Microcontrollers', author: 'Ramesh Gaonkar', category: 'Electronics', isbn: '9788185522988', price: 500, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-10', title: 'Basic Electrical Engineering', author: 'V.K. Mehta', category: 'Electrical', isbn: '9788121924275', price: 400, discountPrice: 340, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-11', title: 'Power Systems Analysis', author: 'John J. Grainger', category: 'Electrical', isbn: '9780070610938', price: 620, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-12', title: 'Electric Machines', author: 'D.P. Kothari', category: 'Electrical', isbn: '9780070648593', price: 540, discountPrice: 470, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-13', title: 'Strength of Materials', author: 'R.K. Bansal', category: 'Mechanical', isbn: '9788131808146', price: 460, discountPrice: null, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-14', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus Cengel', category: 'Mechanical', isbn: '9780073398174', price: 690, discountPrice: 580, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-15', title: 'Theory of Machines', author: 'R.S. Khurmi', category: 'Mechanical', isbn: '9788121925242', price: 430, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-16', title: 'Surveying Vol. 1', author: 'B.C. Punmia', category: 'Civil', isbn: '9788170088610', price: 410, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-17', title: 'Structural Analysis', author: 'R.C. Hibbeler', category: 'Civil', isbn: '9780133942842', price: 640, discountPrice: 520, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-18', title: 'Principles of Management', author: 'Koontz & Weihrich', category: 'MBA', isbn: '9781259006337', price: 550, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-19', title: 'Marketing Management', author: 'Philip Kotler', category: 'MBA', isbn: '9780133856460', price: 680, discountPrice: 590, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-20', title: 'Financial Management', author: 'I.M. Pandey', category: 'MBA', isbn: '9788121942958', price: 500, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },

  // ---- Added to broaden the catalog past 50 titles; each carries a real,
  // published ISBN so a real cover photo resolves for it via the same
  // coverImgTag() fallback chain every other book already uses. ----
  { id: 'c-21', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest & Stein', category: 'Computer Science', isbn: '9780262033848', price: 850, discountPrice: 720, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-22', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', category: 'Computer Science', isbn: '9780136042594', price: 780, discountPrice: 650, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-23', title: 'Computer Organization and Design', author: 'David Patterson & John Hennessy', category: 'Computer Science', isbn: '9780124077263', price: 690, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-24', title: 'Database System Concepts', author: 'Silberschatz, Korth & Sudarshan', category: 'Computer Science', isbn: '9780073523323', price: 640, discountPrice: 560, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-25', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Gamma, Helm, Johnson & Vlissides', category: 'Computer Science', isbn: '9780201633610', price: 560, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-26', title: 'The C Programming Language', author: 'Brian Kernighan & Dennis Ritchie', category: 'Computer Science', isbn: '9780131103627', price: 380, discountPrice: 320, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-27', title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', category: 'Computer Science', isbn: '9780073383095', price: 610, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-28', title: 'Signals and Systems', author: 'Alan V. Oppenheim & Alan S. Willsky', category: 'Electronics', isbn: '9780138147570', price: 590, discountPrice: 500, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-29', title: 'Digital Signal Processing', author: 'John G. Proakis & Dimitris Manolakis', category: 'Electronics', isbn: '9780131873742', price: 630, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-30', title: 'Power Electronics', author: 'Ned Mohan', category: 'Electronics', isbn: '9780471226932', price: 700, discountPrice: 610, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-31', title: 'Integrated Electronics', author: 'Jacob Millman & Christos Halkias', category: 'Electronics', isbn: '9780070260327', price: 480, discountPrice: null, status: 'Sold', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-32', title: 'Electronic Communication Systems', author: 'George Kennedy', category: 'Electronics', isbn: '9780070707829', price: 520, discountPrice: 440, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-33', title: 'Electric Circuits', author: 'James W. Nilsson & Susan Riedel', category: 'Electrical', isbn: '9780133391090', price: 660, discountPrice: 570, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-34', title: 'Control Systems Engineering', author: 'Norman S. Nise', category: 'Electrical', isbn: '9781118170519', price: 700, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-35', title: 'Power System Analysis and Design', author: 'J. Duncan Glover', category: 'Electrical', isbn: '9781111425777', price: 640, discountPrice: 540, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-36', title: 'Generation, Distribution and Utilization of Electrical Energy', author: 'C.L. Wadhwa', category: 'Electrical', isbn: '9788122415922', price: 420, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-37', title: 'Electrical Machines', author: 'P.S. Bimbhra', category: 'Electrical', isbn: '9788174091086', price: 460, discountPrice: 380, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-38', title: 'Engineering Mechanics: Statics', author: 'R.C. Hibbeler', category: 'Mechanical', isbn: '9780133918922', price: 620, discountPrice: null, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-39', title: 'Engineering Mechanics: Dynamics', author: 'R.C. Hibbeler', category: 'Mechanical', isbn: '9780133915389', price: 620, discountPrice: 540, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-40', title: 'Fluid Mechanics', author: 'Frank M. White', category: 'Mechanical', isbn: '9780073398273', price: 690, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-41', title: 'Heat and Mass Transfer', author: 'Yunus A. Cengel', category: 'Mechanical', isbn: '9780073398181', price: 680, discountPrice: 590, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-42', title: "Shigley's Mechanical Engineering Design", author: 'Richard Budynas & Keith Nisbett', category: 'Mechanical', isbn: '9780073398204', price: 720, discountPrice: null, status: 'Sold', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-43', title: 'Materials Science and Engineering', author: 'William D. Callister', category: 'Mechanical', isbn: '9781118324578', price: 650, discountPrice: 560, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-44', title: 'Concrete Technology', author: 'M.S. Shetty', category: 'Civil', isbn: '9788121904200', price: 480, discountPrice: null, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-45', title: 'Reinforced Concrete Design', author: 'S. Unnikrishna Pillai & Devdas Menon', category: 'Civil', isbn: '9780070648180', price: 560, discountPrice: 470, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-46', title: 'Soil Mechanics and Foundation Engineering', author: 'K.R. Arora', category: 'Civil', isbn: '9788173200140', price: 500, discountPrice: null, status: 'Sold', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-47', title: 'Environmental Engineering', author: 'Peavy, Rowe & Tchobanoglous', category: 'Civil', isbn: '9780070491343', price: 620, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-48', title: 'Transportation Engineering', author: 'C. Jotin Khisty & B. Kent Lall', category: 'Civil', isbn: '9780131424729', price: 590, discountPrice: 500, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-49', title: 'Building Materials and Construction', author: 'S.K. Duggal', category: 'Civil', isbn: '9788122423581', price: 420, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-50', title: 'Microeconomics', author: 'Robert Pindyck & Daniel Rubinfeld', category: 'MBA', isbn: '9780134184241', price: 640, discountPrice: 560, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-51', title: 'Organizational Behavior', author: 'Stephen P. Robbins', category: 'MBA', isbn: '9780134103983', price: 610, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-52', title: 'Human Resource Management', author: 'Gary Dessler', category: 'MBA', isbn: '9780133545172', price: 580, discountPrice: 500, status: 'Sold', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-53', title: 'Operations Management', author: 'Jay Heizer & Barry Render', category: 'MBA', isbn: '9780133439981', price: 600, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-54', title: 'Cost Accounting: A Managerial Emphasis', author: 'Charles T. Horngren', category: 'MBA', isbn: '9780133428704', price: 650, discountPrice: 560, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-55', title: 'Strategic Management: Concepts and Cases', author: 'Fred R. David', category: 'MBA', isbn: '9780134153649', price: 590, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },

  // ---- Second expansion pass, taking the catalog from 55 to 100 titles.
  // Same rule as above: real ISBNs so coverImgTag()'s fallback chain can
  // resolve a real photographed cover for each one. ----
  { id: 'c-56', title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose & Keith Ross', category: 'Computer Science', isbn: '9780133594140', price: 720, discountPrice: 610, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-57', title: 'Head First Design Patterns', author: 'Eric Freeman & Elisabeth Robson', category: 'Computer Science', isbn: '9780596007126', price: 540, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-58', title: 'Software Engineering', author: 'Ian Sommerville', category: 'Computer Science', isbn: '9780133943030', price: 610, discountPrice: 520, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-59', title: 'Compilers: Principles, Techniques, and Tools', author: 'Aho, Lam, Sethi & Ullman', category: 'Computer Science', isbn: '9780321486813', price: 680, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-60', title: 'Computer Graphics: Principles and Practice', author: 'Foley, van Dam, Feiner & Hughes', category: 'Computer Science', isbn: '9780321399526', price: 750, discountPrice: 640, status: 'Sold', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-61', title: 'Java: The Complete Reference', author: 'Herbert Schildt', category: 'Computer Science', isbn: '9780071808552', price: 560, discountPrice: null, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-62', title: 'Let Us C', author: 'Yashavant Kanetkar', category: 'Computer Science', isbn: '9788183331630', price: 320, discountPrice: 270, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-63', title: 'Microelectronic Circuits', author: 'Adel Sedra & Kenneth Smith', category: 'Electronics', isbn: '9780199339136', price: 690, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-64', title: 'Op-Amps and Linear Integrated Circuits', author: 'Ramakant Gayakwad', category: 'Electronics', isbn: '9780132808682', price: 470, discountPrice: 400, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-65', title: 'Electronic Devices', author: 'Thomas L. Floyd', category: 'Electronics', isbn: '9780133444816', price: 500, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-66', title: 'Principles of Electronics', author: 'V.K. Mehta & Rohit Mehta', category: 'Electronics', isbn: '9788121924975', price: 440, discountPrice: 370, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-67', title: 'Digital Communications', author: 'John G. Proakis', category: 'Electronics', isbn: '9780072957167', price: 660, discountPrice: null, status: 'Sold', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-68', title: 'Power System Protection and Switchgear', author: 'Badri Ram & D.N. Vishwakarma', category: 'Electrical', isbn: '9780070494046', price: 550, discountPrice: 470, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-69', title: 'Electric Power Transmission System Engineering', author: 'Turan Gonen', category: 'Electrical', isbn: '9781439856338', price: 710, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-70', title: 'Modern Power System Analysis', author: 'D.P. Kothari & I.J. Nagrath', category: 'Electrical', isbn: '9780070260792', price: 640, discountPrice: 550, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-71', title: 'Utilization of Electric Power', author: 'J.B. Gupta', category: 'Electrical', isbn: '9788178292169', price: 430, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-72', title: 'Switchgear and Protection', author: 'Sunil S. Rao', category: 'Electrical', isbn: '9788173190476', price: 460, discountPrice: 390, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-73', title: 'Machine Design', author: 'V.B. Bhandari', category: 'Mechanical', isbn: '9780070681795', price: 590, discountPrice: null, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-74', title: 'Internal Combustion Engines', author: 'V. Ganesan', category: 'Mechanical', isbn: '9780070707996', price: 610, discountPrice: 520, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-75', title: 'Refrigeration and Air Conditioning', author: 'C.P. Arora', category: 'Mechanical', isbn: '9780070604306', price: 570, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-76', title: 'Manufacturing Technology', author: 'P.N. Rao', category: 'Mechanical', isbn: '9780070669199', price: 540, discountPrice: 460, status: 'Sold', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-77', title: 'Automobile Engineering', author: 'Kirpal Singh', category: 'Mechanical', isbn: '9788123908956', price: 500, discountPrice: null, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-78', title: 'Surveying Vol. 2', author: 'B.C. Punmia', category: 'Civil', isbn: '9788170088689', price: 410, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-79', title: 'Design of Steel Structures', author: 'N. Subramanian', category: 'Civil', isbn: '9780198072434', price: 630, discountPrice: 540, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-80', title: 'Water Resources Engineering', author: 'S.K. Garg', category: 'Civil', isbn: '9788170082159', price: 480, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-81', title: 'Highway Engineering', author: 'S.K. Khanna & C.E.G. Justo', category: 'Civil', isbn: '9788190818929', price: 520, discountPrice: 440, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-82', title: 'Geotechnical Engineering', author: 'C. Venkatramaiah', category: 'Civil', isbn: '9788122417650', price: 490, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-83', title: 'Principles of Marketing', author: 'Philip Kotler & Gary Armstrong', category: 'MBA', isbn: '9780134492513', price: 660, discountPrice: 570, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-84', title: 'Business Analytics', author: 'James R. Evans', category: 'MBA', isbn: '9780134475874', price: 620, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-85', title: 'Managerial Economics', author: 'D.N. Dwivedi', category: 'MBA', isbn: '9788126915670', price: 450, discountPrice: 380, status: 'Sold', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-86', title: 'Essentials of Investments', author: 'Bodie, Kane & Marcus', category: 'MBA', isbn: '9780077835422', price: 700, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-87', title: 'International Business', author: 'Charles W.L. Hill', category: 'MBA', isbn: '9781259578113', price: 610, discountPrice: 520, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-88', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', category: 'Mathematics', isbn: '9788174091956', price: 480, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-89', title: 'Advanced Engineering Mathematics', author: 'Erwin Kreyszig', category: 'Mathematics', isbn: '9780470458365', price: 690, discountPrice: 590, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-90', title: 'Calculus', author: 'James Stewart', category: 'Mathematics', isbn: '9781285740621', price: 720, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-91', title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', category: 'Mathematics', isbn: '9780980232776', price: 580, discountPrice: 490, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-92', title: 'Complex Variables and Applications', author: 'James Brown & Ruel Churchill', category: 'Mathematics', isbn: '9780073383170', price: 550, discountPrice: null, status: 'Sold', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-93', title: 'Probability and Statistics for Engineers and Scientists', author: 'Walpole, Myers, Myers & Ye', category: 'Mathematics', isbn: '9780134461544', price: 610, discountPrice: 520, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-94', title: 'Concepts of Physics Part 1', author: 'H.C. Verma', category: 'Physics', isbn: '9788177091878', price: 340, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] },
  { id: 'c-95', title: 'Engineering Physics', author: 'H.K. Malik & A.K. Singh', category: 'Physics', isbn: '9780070671561', price: 400, discountPrice: 340, status: 'Available', coverColors: ['#7C5CD6', '#4A3496'] },
  { id: 'c-96', title: 'University Physics with Modern Physics', author: 'Hugh Young & Roger Freedman', category: 'Physics', isbn: '9780321973610', price: 750, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 'c-97', title: 'Fundamentals of Physics', author: 'Halliday, Resnick & Walker', category: 'Physics', isbn: '9781118230718', price: 700, discountPrice: 610, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 'c-98', title: 'Engineering Chemistry', author: 'P.C. Jain & Monica Jain', category: 'Chemistry', isbn: '9788193593093', price: 380, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] },
  { id: 'c-99', title: 'Organic Chemistry', author: 'Robert Morrison & Robert Boyd', category: 'Chemistry', isbn: '9788131715622', price: 590, discountPrice: 500, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 'c-100', title: 'Physical Chemistry', author: 'Peter Atkins & Julio de Paula', category: 'Chemistry', isbn: '9780199543373', price: 670, discountPrice: null, status: 'Available', coverColors: ['#2A2E35', '#101215'] }
];

const SELL_BOOKS = [
  { id: 's-01', title: 'Data Structures Using C', author: 'Reema Thareja', category: 'Computer Science', isbn: '9780198099307', price: 300, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'] },
  { id: 's-02', title: 'Basic Electrical Engineering', author: 'V.K. Mehta', category: 'Electrical', isbn: '9788121924275', price: 250, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'] },
  { id: 's-03', title: 'Strength of Materials', author: 'R.K. Bansal', category: 'Mechanical', isbn: '9788131808146', price: 280, discountPrice: null, status: 'Available', coverColors: ['#C4433A', '#7C201B'] },
  { id: 's-04', title: 'Marketing Management', author: 'Philip Kotler', category: 'MBA', isbn: '9780133856460', price: 420, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'] }
];

const UPLOAD_BOOKS = [
  { id: 'u-seed-01', title: 'Digital Logic Design', author: 'Morris Mano', category: 'Electronics', isbn: '9780132774208', price: 260, discountPrice: null, status: 'Available', coverColors: ['#3E6FD6', '#1F3E8C'], source: 'upload', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 'u-seed-02', title: 'Financial Management', author: 'I.M. Pandey', category: 'MBA', isbn: '9788121942958', price: 300, discountPrice: null, status: 'Available', coverColors: ['#2F6F5E', '#173F35'], source: 'upload', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  { id: 'u-seed-03', title: 'Surveying Vol. 1', author: 'B.C. Punmia', category: 'Civil', isbn: '9788170088610', price: 220, discountPrice: null, status: 'Available', coverColors: ['#C9A227', '#8C6E12'], source: 'upload', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() }
];
