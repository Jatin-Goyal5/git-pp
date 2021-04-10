
const puppeteer = require('puppeteer');
const fs = require('fs');
let tab;
let days =['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
(async function(){
    try{
        const url = 'https://myanimelist.net/anime/season/schedule';
        let browser =  await puppeteer.launch({
            headless: false,
            defaultViewport:null , 
          
            args:["--start-maximised"]
        });
        let page = await browser.pages();
         tab = page[0];
        await tab.goto(url);
    
        // link for list for all day 
        let sheduleWait = await tab.waitForSelector('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-monday.clearfix  .seasonal-anime.js-seasonal-anime .eps',{visible:true});
    
        for(let i =0 ; i < days.length ; ++i){
            let day = `./${days[i]}`;
            let scheduleDay = await tab.$$(`.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-${days[i]}.clearfix  .seasonal-anime.js-seasonal-anime .eps a`);
            if(fs.existsSync(day)){
                getInfo(await getlink(scheduleDay),browser,day);    
            }else{
                await fs.mkdirSync(day);
                getInfo(await getlink(scheduleDay),browser,day);    
            }
            
        }

    }catch(e){
        console.log(e);
    }
  
  
}
)();

async function getlink(scheduleDay){
    try{
        let linkList= [];
        for(let i =0 ; i < scheduleDay.length ; ++i){
            let animeLink = await tab.evaluate(function(element){
                return element.getAttribute("href");
            },scheduleDay[i]);
            linkList.push(animeLink);
        }
        return linkList;
    }catch(e){
        console.log(e);
    }

   
    

}

async function getInfo(linkList,browser,day){
    try{
        
    let newTab = await browser.newPage();
    for(let i =0 ; i < linkList.length; ++i){

    await newTab.goto(linkList[i]);
    await newTab.waitForSelector('.title-name',{visible:true});
    
    // title
    let titlePromise = await newTab.$('.title-name');
    let title = await newTab.evaluate(function(element){
        return element.textContent;
    },titlePromise);
    console.log(title +"");

    // Genres
    let genres = await newTab.$$('span[itemprop="genre"]');
    let genreList =[];
    for(let i =0 ; i < genres.length ; ++i){
        let genre = await newTab.evaluate(function(element){
            return element.textContent;
        },genres[i]);
        genreList.push(genre);
    }

    // episodesList
    let episodes =[];
    let episodesTag = await newTab.$$(".episode-title .fl-l.fw-b");
    for(let i =0 ; i < episodesTag.length ; ++i){
        let episodeDetail={
            'episodeNumber': i,
           'episodeName': await newTab.evaluate(function(element){
                    return element.text;
                },episodesTag[i]),
            'episodeLink' : await newTab.evaluate(function(element){
                return element.getAttribute('href');
            },episodesTag[i]),
        };
        episodes.push(episodeDetail);
    }

    //another Detail
    let anotherData = await newTab.$$('.spaceit');
    let detailName =[],detailInfo =[];
    for(let i = 7 ; i < anotherData.length ; i++){
        let a = await newTab.evaluate(function(element){
        return element.textContent;
    },anotherData[i]);
    a = a.split(':');
    detailName.push(a[0].trim());
    detailInfo.push(a[1].trim())
    // console.log(a.trim());
    }
    
    // character 
    let link = await newTab.$$("#horiznav_nav li a");
    let cLink = await newTab.evaluate(function(element){
        return element.getAttribute('href');
    },link[0]);
    await newTab.goto(cLink);
    // await tab.waitForTimeout(5000);
    await newTab.waitForSelector('.detail-characters-list.clearfix .h3_characters_voice_actors',{visible:true});
    let characters = await newTab.$$('.detail-characters-list.clearfix .h3_characters_voice_actors');

    let charactersList =[];
    for(let i =0 ; i < characters.length ; ++i){
        charactersList.push(await newTab.evaluate(function(element){
            return element.textContent;
        },characters[i]));
    }

    //score Detail 
    let scoreEvaluate = await newTab.$('.score-label'); 
    let score = await newTab.evaluate(function(element){
        return element.textContent;
    },scoreEvaluate);

    // popularity 
    let popularityEvaluate = await newTab.$('.numbers.popularity'); 
    let popularity = await newTab.evaluate(function(element){
        return element.textContent;
    },popularityEvaluate);

    // summary 
    let summaryEvaluate = await newTab.$('p[itemprop="description"]'); 
    let summary = await newTab.evaluate(function(element){
        return element.textContent;
    },summaryEvaluate);


    if(fs.existsSync(`${day}/${title}.json`)){
        //
    }else{
        let animeFileName = linkList[i].split('/');
        let filePath = `${day}/${animeFileName[animeFileName.length-2]}`;
        await addDetail(filePath,title,genreList,episodes,detailName , detailInfo,charactersList,score,popularity,summary)
    }

    } 


    }
    catch(e){
        console.log(e);
    }
    
}

async function addDetail(filePath,title ,genreList,episodes,detailName,detailInfo,charactersList,score,popularity,summary){
   try{
    if(fs.existsSync(filePath)){
        //
    }else{
       await fs.mkdirSync(filePath);

        let addEpisode =[];
        let cepisode ={
            episodes,
        }
        addEpisode.push(cepisode);
        let episodeStrigify = JSON.stringify(addEpisode);
        await fs.writeFileSync(`${filePath}/episodes.json`,episodeStrigify);

        ///
        let data = [];
        let cdata = {
            title,
            summary,
            "genres": genreList,
            charactersList,
            score,
            popularity
        };
        for(let i =0 ; i < detailInfo.length ; i++){
            if(detailName[i] == "Ranked"){
                detailInfo[i] = detailInfo[i].split('\n');
                cdata[detailName[i]] = detailInfo[i][0];
            }else
                cdata[detailName[i]] = detailInfo[i];
        }
        data.push(cdata);
        let sdata = JSON.stringify(data);
        await fs.writeFileSync(`${filePath}/detail.json`,sdata);

    }
   }
   catch(e){
       console.log(e);
   }
   


}
