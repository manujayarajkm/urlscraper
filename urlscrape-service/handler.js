const cheerio = require('cheerio');
const axios = require('axios');

exports.scrapper = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let resObj = {};
  let scrapped = {};
  try{
    const requestObj= JSON.parse(event.body);
    if(!(requestObj.url)||requestObj.url===""||requestObj.url===null){
      scrapped = {
        statusCode: 412,
        body: "Missing url in the request body"
    };
    return {
      statusCode:412,
      body:JSON.stringify(scrapped)
    }
    }
    else{
  await axios(requestObj.url)
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
      scrapped = {
        statusCode: 200,
        body: resObj
    };
    })
    .catch(error => {
      scrapped = {
          statusCode: error.response.status || 500,
          body: error.response.statusText || "Something went wrong"
      }
  })
  return {
    statusCode:scrapped.statusCode,
    body:JSON.stringify(scrapped)
  }
    }
} catch (error) {
  return {
    statusCode: 500,
      body: "Internal Server Error"
  }
}

};
