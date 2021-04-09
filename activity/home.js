// const { link } = require('node:fs');
// const { link } = require('node:fs');
const puppeteer = require('puppeteer');
let tab;
(async function(){
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
    let sheduleWait = await tab.waitForSelector('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-monday.clearfix  .seasonal-anime.js-seasonal-anime .title');
    let scheduleMonday = await tab.$$('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-monday.clearfix  .seasonal-anime.js-seasonal-anime .title a');
    let scheduleTuesday = await tab.$$('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-tuesday.clearfix  .seasonal-anime.js-seasonal-anime .title a');
    let scheduleWednesday = await tab.$$('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-wednesday.clearfix  .seasonal-anime.js-seasonal-anime .title a');
    let scheduleThursday = await tab.$$('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-thursday.clearfix  .seasonal-anime.js-seasonal-anime .title a');
    let scheduleFriday = await tab.$$('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-friday.clearfix  .seasonal-anime.js-seasonal-anime .title a');
    let scheduleSunday = await tab.$$('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-sunday.clearfix  .seasonal-anime.js-seasonal-anime .title a');
    
    getInfo(await getlink(scheduleMonday),browser);
}
)();

async function getlink(scheduleDay){

    let linkList= [];
    for(let i =0 ; i < scheduleDay.length ; ++i){
        let animeLink = await tab.evaluate(function(element){
            return element.getAttribute("href");
        },scheduleDay[i]);
        linkList.push(animeLink);
    }
    return linkList;
    

}

async function getInfo(linkList,browser){
    console.log(linkList);
    
    let newTab = await browser.newPage();
    // for(let i =0 ; i < linkList.length; ++i){
    //     let obj ={};
    //     await newTab.goto(linkList[i]);
    //     await newTab.waitForSelector('.dark_text');
    //     let data = await newTab.$$('dark_text');
    //     console.log(data);

    // }
    let obj ={};
    await newTab.goto(linkList[0]);
    await newTab.waitForSelector('.spaceit');
    let data = await newTab.$$('.spaceit');
    let a = await newTab.evaluate(function(element){
        return element.textContent;
    },data[8]);
    // let ar =[];
    // ar.push(data[0]);

    console.log(a+"");

}

