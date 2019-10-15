const cheerio = require('cheerio');
const axios = require('axios');

module.exports.scraper = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let resObj = {};

  await axios(JSON.parse(event.body).url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      //create a reference to the meta elements
      ($title = $('head title').text()),
        ($desc = $('meta[name="description"]').attr('content')),
        ($kwd = $('meta[name="keywords"]').attr('content')),
        ($ogTitle = $('meta[property="og:title"]').attr('content')),
        ($ogImage = $('meta[property="og:image"]').attr('content')),
        ($ogkeywords = $('meta[property="og:keywords"]').attr('content')),
        ($images = $('img'));

      if ($title) {
        resObj.title = $title;
      }

      if ($desc) {
        resObj.description = $desc;
      }

      if ($kwd) {
        resObj.keywords = $kwd;
      }

      if ($ogImage && $ogImage.length) {
        resObj.ogImage = $ogImage;
      }

      if ($ogTitle && $ogTitle.length) {
        resObj.ogTitle = $ogTitle;
      }

      if ($ogkeywords && $ogkeywords.length) {
        resObj.ogkeywords = $ogkeywords;
      }

      if ($images && $images.length) {
        resObj.images = [];

        for (var i = 0; i < $images.length; i++) {
          resObj.images.push($($images[i]).attr('src'));
        }
      }
    })
    .catch(console.error);
  let res = {
    statusCode: 200,
    body: JSON.stringify(resObj),
  };
  return res;
};
