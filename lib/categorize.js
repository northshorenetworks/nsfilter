import dns from 'native-dns';

let cache = {};

export default (site, fn) => {
  if (cache[site]) {
    return fn(cache[site]);
  }

  site = encodeUrl(site);

  let categories = [];
  let question = dns.Question({
    name: site + '.nsc',
    type: 'A'
  });

  let request = dns.Request({
    question: question,
    server: { address: '104.207.150.74', port: 53, type: 'udp' },
    timeout: 1000
  });

  request.on('timeout', () => {
    fn([]);
  });

  request.on('message', (err, response) => {
    let answers = response.answer.map(a => {
      return Number(a.address.split('.').splice(-1)[0]);
    });

    categories.push.apply(categories, answers);
  });

  request.on('end', () => {
    cache[site] = categories;
    fn(categories);
  });

  request.send();
};

function encodeUrl(url) {
  // Match to RegExp groups (domain, port, path)
  url = url.match(/^(?:[^:\/]*:\/\/)?([^:\/\\]*)(:\d+)?([\/\\][^?#]*)?/);

  var query = url[1].replace(/\.$/, ''); // Remove any trailing dots
  query += url[2] || ''; // Append port
  query += url[3] || ''; // Append path

  query = query
    .replace(/[.\/]+$/, '')                // Remove trailing dots or slashes
    .replace(/_-/g, '_-_-')                // Replace _- with _-_-
    .replace(/\//g, '_-.')                 // Convert / to _-.
    .replace(/\.\./g, '._-2e')             // Convert consecutive or ending dots 
    .replace(/\.$/, '._-2e')               //   to ._-2e and _-2e respectively
    .replace(/:/g, '_--')                  // Convert : to _--
    .replace(/%([a-fA-F0-9]{2})/g, '_-$1') // Convert %xx to encoded form
    .replace(/%/g, '_-25')                 // Convert % characters to _-25
    .replace(/([^a-zA-Z0-9._-])/g, function (a) {
      // Convert any remaining non-RFC characters
      return '_-' + (new Buffer(a)).toString('hex').match(/.{2}/g).join('_-')
    })
    .replace(/([^.]{55}[^._]{0,4})([^.])/g, '$1_-0.$2');

  return query;
}

export const ID_TO_NAMES = {
  "0"  : "Unclassified",
  "1"  : "Compromised",
  "2"  : "Criminal Skills/Hacking",
  "3"  : "Hate Speech",
  "4"  : "Illegal Drugs",
  "5"  : "Phishing/Fraud",
  "6"  : "Spyware and Malicious Sites",
  "7"  : "Nudity",
  "8"  : "Mature",
  "9"  : "Pornography/Sex",
  "10" : "Violence",
  "11" : "Weapons",
  "12" : "Anonymizer",
  "13" : "Computers and Technology",
  "14" : "Download Sites",
  "15" : "Translator",
  "16" : "Alcohol",
  "17" : "Health",
  "18" : "Pharmacy",
  "19" : "Tobacco",
  "20" : "Gambling",
  "21" : "Games",
  "22" : "Cars/Transportation",
  "23" : "Dating",
  "24" : "Home/Leisure",
  "25" : "Personal Webpages",
  "26" : "Restaurants",
  "27" : "Sports and Recreation",
  "28" : "Travel",
  "29" : "Government",
  "30" : "Military",
  "31" : "Non-profits",
  "32" : "Politics and Law",
  "33" : "Religion",
  "34" : "Education",
  "35" : "Art",
  "36" : "Entertainment and Videos",
  "37" : "Humor",
  "38" : "Music",
  "39" : "News",
  "40" : "Finance",
  "42" : "Shopping",
  "43" : "Chat/IM",
  "44" : "Community Sites",
  "45" : "Social Networking",
  "46" : "Web-based Email",
  "47" : "Portal Sites",
  "48" : "Search Engines",
  "49" : "Adware",
  "50" : "Business/Services",
  "51" : "Job Search",
  "52" : "Real Estate",
  "53" : "Spam",
  "54" : "Miscellaneous"
};