(function() { 

/*****************************************/
/*     globale Variablen fuer die App     */
/*****************************************/

var cookiesEnabledPreviousChoice=false;
var cookiesEnabled=false;
var p;

var singlePlaylistId=""; //in single-playlist-page. zum Erkennen, ob schon nach den playlistItems gesucht wurde oder nicht
var isFavoritePageInitialized=false;
var isSinglePlaylistPageInitialized=false;
var notTinderedPlaylists=[];
var notTinderedPlaylistIndex=0;
var isTinderPageInitialized=false;
var isCategoriesPageInitialized=[];

/*****************************************/
/*     Tinder initieren                  */
/*****************************************/

async function initTinder(){
  activateMainMenuButtons();
  activateCategoryPageButtons();

  window.cookieconsent.initialise({
    "palette": {
      "popup": {
        "background": "#000"
      },
      "button": {
        "background": "#f1d600"
      }
    },
    "container": document.getElementById("cookie-notify"),
    "position": "top",
    "type": "opt-in",
    "content": {
      "message": "Diese Seite verwendt Cookies, damit Sie die Website f\u00fcr Sie optimal gestalten und an Ihren Interessen ausrichten k\u00f6nnen. Die Verwendung erfolgt nur mit Ihrer ausdr\u00fccklichen Erlaubnis.",
      "dismiss": "Cookies unterbinden",
      "deny": "Cookies unterbinden",
      "allow": "Cookies erlauben",
      "link": "Mehr anzeigen",
      "href": "https://www.cookiesandyou.com"
    },
    onPopupOpen: function() {
      document.getElementById("cookie-notify").classList.remove("invisible");
      console.log('onPopupOpen() called');
    },
    onPopupClose: function() {
      console.log('onPopupClose() called');
      document.getElementById("cookie-notify").classList.add("invisible");
      if (cookiesEnabledPreviousChoice!=cookiesEnabled){
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        cookiesEnabledPreviousChoice=cookiesEnabled;
      }
    },
    onInitialise: function (status) {
      console.log('onInitialise() called with status '+status);
      var type = this.options.type;
      let cookieStatus = this.getStatus();
      if (type == 'opt-in' && cookieStatus==="allow") {
        // enable cookies
        cookiesEnabledPreviousChoice=true;
        cookiesEnabled=true;
      }
    },
    onStatusChange: function(status, chosenBefore) {
      console.log('onStatusChange() called with status '+status);
      var type = this.options.type;
      let cookieStatus = this.getStatus();
      if (type == 'opt-in' && cookieStatus==="allow") {
        // enable cookies
        cookiesEnabled=true;
      }
    },
    onRevokeChoice: function() {
      console.log('onRevokeChoice() called');
      var type = this.options.type;
      if (type == 'opt-in') {
        // disable cookies
        cookiesEnabled=false;
      }
    },
  }, function (popup) {
    p = popup;
  }, function (err) {
    console.error(err);
  });
  document.getElementById("cookie-revoke-button").addEventListener('click',function(evt){
    p.revokeChoice();
  });
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/*****************************************/
/*            Main-Menu                  */
/*****************************************/

function activateMainMenuButtons(){
  document.getElementById('mm-fav').addEventListener('click',function(){
    window.location.hash = 'favoriten/';
  });
  document.getElementById('mm-tinder').addEventListener('click',function(){
    window.location.hash = 'tinder/';
  });
  document.getElementById('mm-rubriken').addEventListener('click',function(){
    window.location.hash = 'kategorien/';
  });
  document.getElementById('mm-playlist').addEventListener('click',function(){
    window.location.hash = 'format/'+singlePlaylistId;
  });
  document.getElementById('mm-properties').addEventListener('click',function(){
    window.location.hash = 'properties/';
  });
}
function activateCategoryPageButtons(){
  document.getElementById('category-button-rbtv').addEventListener('click',function(){
    window.location.hash = 'kategorien/';
  });
  document.getElementById('category-button-community').addEventListener('click',function(){
    window.location.hash = 'kategorien/community';
  });
  document.getElementById('category-button-gaming').addEventListener('click',function(){
    window.location.hash = 'kategorien/gaming';
  });
  document.getElementById('category-button-non-gaming').addEventListener('click',function(){
    window.location.hash = 'kategorien/non-gaming';
  });

}



/****************************************************/
/*   ********************************************   */
/*   *      alles rund ums Hash in der url      *   */
/*   ********************************************   */
/****************************************************/

window.addEventListener("hashchange", function(){
  // On every hash change the render function is called with the new hash.
  // This is how the navigation of our app happens.
  render(decodeURI(window.location.hash));
}, false);

//This function decides what type of page to show depending on the current url hash value.
function render(url) {
  document.getElementById("loader").classList.remove("invisible");
  document.getElementById("favoriten-container").classList.add("invisible");
  document.getElementById("single-playlist-container").classList.add("invisible");
  document.getElementById("tinder-container").classList.add("invisible");
  document.getElementById("categories-container").classList.add("invisible");
  document.getElementById("terms-of-use-container").classList.add("invisible");
  document.getElementById("properties-container").classList.add("invisible");
  document.getElementById("impressum-container").classList.add("invisible");
  document.getElementById("privacy-policy-container").classList.add("invisible");
  setTimeout(function(){
    console.log("in render");
    // Get the keyword from the url.
    var temp = url.split('/')[0];
    //// Hide whatever page is currently shown.
    //$('.main-content .page').removeClass('visible');
    var map = {
      // The Homepage.
      '': function() {
            //// Clear the filters object, uncheck all checkboxes, show all the products
            //filters = {};
            //checkboxes.prop('checked',false);
            renderFavoritePage();
          },
      // The Favorite Page.
      '#favoriten': function() {
            //// Clear the filters object, uncheck all checkboxes, show all the products
            //filters = {};
            //checkboxes.prop('checked',false);
            renderFavoritePage();
          },
      // The Tinder Page.
      '#tinder': function() {
            renderTinderPage();
          },
      // The Categories Page.
      '#kategorien': function() {
            var categoryTheme = url.split('#kategorien/')[1].trim();
            renderCategoriesPage(categoryTheme);
          },
      //Single Playlist PAGE.
      '#format': function() {
                        // Get the id of the playlist and video in that playlist and render the Video-Player-Page
                        var videoId = url.split('#format/')[1].trim();
                        renderSinglePlaylistPage(videoId);
                      },
      '#properties': function() {
                        renderPropertiesPage("properties-container");
                      },
      '#terms-of-use': function() {
                        renderPropertiesPage("terms-of-use-container");
                      },
      '#privacy-policy': function() {
                        renderPropertiesPage("privacy-policy-container");
                      },
      '#impressum': function() {
                        renderPropertiesPage("impressum-container");
                      },
      };
    
    // Execute the needed function depending on the url keyword (stored in temp).
    if( (map[temp]&&cookiesEnabled===true)||(cookiesEnabled===false&&(temp==='#kategorien'||temp==='#properties')) ){
      map[temp]();
    }
    // If the keyword isn't listed in the above - render the error page.
    else {
      renderErrorPage();
    }
 },5);//ende von setTimeout
}

/*************************************************/
/*          render Properties-Page               */
/*************************************************/

function renderPropertiesPage(page){
  document.getElementById(page).classList.remove("invisible");
  document.getElementById("loader").classList.add("invisible");
}

/************************************************/
/*          render Favoriten-Page               */
/************************************************/

async function renderFavoritePage(){
  //if(isFavoritePageInitialized===false){
  //  swiper = new FavoriteSwiper(document.getElementById("favoriten-ohne-neue-folgen-container"));
  //  swiper.run();
  //  isFavoritePageInitialized=true;
  //}
  removeAllFavorites();
  removeAllFromNewFavoritesContainer();
  await sucheFavoriten2();
  //padding berechnen
  //document.getElementById("favoriten-mit-neuen-folgen-container").style.paddingBottom = document.getElementById("all-favorites-nav").offsetHeight+"px";
  //document.getElementById("favoriten-container").style.display="initial";
  //document.getElementById("single-playlist-container").style.display="none";
  //document.getElementById("tinder-container").style.display="none";
  //document.getElementById("categories-container").style.display="none";
  document.getElementById("loader").classList.add("invisible");
  document.getElementById("favoriten-container").classList.remove("invisible");
}

function removeAllFavorites(){
    document.getElementById("all-favorites-nav").removeChild(document.getElementById("favoriten-ohne-neue-folgen-container"));  
    var newAllFavoritesList = document.createElement('div');
    newAllFavoritesList.setAttribute("class","swipe-container-all");
    newAllFavoritesList.setAttribute("id","favoriten-ohne-neue-folgen-container");
    document.getElementById("all-favorites-nav").appendChild(newAllFavoritesList);
}


/************************************************/
/*             render Tinder-Page               */
/************************************************/

async function renderTinderPage(){
  document.getElementById("loader").classList.remove("invisible");
  document.getElementById("favoriten-container").classList.add("invisible");
  document.getElementById("single-playlist-container").classList.add("invisible");
  document.getElementById("tinder-container").classList.add("invisible");
  document.getElementById("categories-container").classList.add("invisible");

    //var tinderSwipe = new Swipe(document.getElementById("intro2"));
    //tinderSwipe.run();
    //var tinderSwipe = new Swipe(document.getElementById("intro3"));
    //tinderSwipe.run();
    //var tinderSwipe = new Swipe(document.getElementById("intro4"));
    //tinderSwipe.run();
    //var tinderSwipe = new Swipe(document.getElementById("intro5"));
    //tinderSwipe.run();

    //document.getElementById("intro2").classList.add("invisible");
    //document.getElementById("intro3").classList.add("invisible");
    //document.getElementById("intro4").classList.add("invisible");
    //document.getElementById("intro5").classList.add("invisible");

  if(isTinderPageInitialized===false){
    //fuege Erklarungen hinzu

    var tinderablePlaylists = getPlaylists("id",1);
    //alert(tinderablePlaylists.length);
    //Tinder-Datenbank: TinderedPlaylists
    //TinderedPlaylist={
    //                 playlistId = String;
    //                 TinderStatus \in {like, dislike, aufgeschoben}
    //                 };
    let tinderedPlaylists = await getTinderedPlaylistsById();
    //alert("Laenge="+tinderedPlaylists.length);
    //let tinderedPlaylists = [];
    //wir bestimmen die noch nicht getinderten Playlists:
    notTinderedPlaylists = [];
    let i=0;
    let j=0;
    //alert("00");
    while (i<tinderedPlaylists.length){
      //alert(tinderedPlaylists[0]);
      //alert("i="+i+",j="+j);
      if(j>=tinderablePlaylists.length){
        break;
      }
      if(tinderedPlaylists[i]>tinderablePlaylists[j].id){
        //alert(tinderedPlaylists[i]+" > "+tinderablePlaylists[j].id);
        notTinderedPlaylists.push(tinderablePlaylists[j]);
        j=j+1;
      }else if(tinderedPlaylists[i]===tinderablePlaylists[j].id){
        //alert(tinderedPlaylists[i]+" = "+tinderablePlaylists[j].id);
        j=j+1;
        i=i+1;
      }else{ //dh. tinderedPlaylists[i]>tinderablePlaylists[j].id
        //alert(tinderedPlaylists[i]+" < "+tinderablePlaylists[j].id);
        i=i+1;
      }
    }
    //alert("j="+j);
    //alert(tinderablePlaylists[j].title);
    for(let l=j;l<tinderablePlaylists.length;l++){
      notTinderedPlaylists.push(tinderablePlaylists[l]);
    }
    //alert(notTinderedPlaylists.length);
    if(notTinderedPlaylists){
      notTinderedPlaylists.sort(function(a,b){return(a["tinderPosition"]>b["tinderPosition"])? 1 :((b["tinderPosition"]>a["tinderPosition"])? -1 :0);});

      //alert(notTinderedPlaylists[0].title);
      if(notTinderedPlaylists[notTinderedPlaylistIndex]){
        //addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
        //addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex+1].id,notTinderedPlaylists[notTinderedPlaylistIndex+1].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex+1].title,notTinderedPlaylists[notTinderedPlaylistIndex+1].description,notTinderedPlaylists[notTinderedPlaylistIndex+1].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex+1].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex+1].itemCount);
        var tinderSwipe = await createTinderSwipe(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
        console.log("tinderSwipe= "+tinderSwipe);
        tinderSwipe.onRun(function(){
          if(notTinderedPlaylists[notTinderedPlaylistIndex+1]){
            //alert("i= "+notTinderedPlaylistIndex);
            addTinderTemplateToTinderPage(notTinderedPlaylists[notTinderedPlaylistIndex+1].id,notTinderedPlaylists[notTinderedPlaylistIndex+1].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex+1].title,notTinderedPlaylists[notTinderedPlaylistIndex+1].description,notTinderedPlaylists[notTinderedPlaylistIndex+1].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex+1].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex+1].itemCount);
            //alert("onRun-id= "+notTinderedPlaylists[notTinderedPlaylistIndex+1].id);
          }
        }).onLeft(function(){
          if(notTinderedPlaylists[notTinderedPlaylistIndex+1]){
            addTinderedPlaylist(this.element.className,"dislike");
            //alert("onLeft-id= "+videoId);
            let emnt = this.element;
            setTimeout(function(element){
              element.parentElement.parentElement.removeChild(element.parentElement);
            },300,emnt);
            notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
            tinderSwipe.changeElement(document.getElementById("tinder-container").querySelector("."+notTinderedPlaylists[notTinderedPlaylistIndex].id)).run();
            //alert(this.element.className);
          }
        }).onRight(function(){
          if(notTinderedPlaylists[notTinderedPlaylistIndex+1]){
            addFavorite(this.element.className);
            addTinderedPlaylist(this.element.className,"like");
            let emnt = this.element;
            setTimeout(function(element){
              element.parentElement.parentElement.removeChild(element.parentElement);
            },300,emnt);
            notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
            tinderSwipe.changeElement(document.getElementById("tinder-container").querySelector("."+notTinderedPlaylists[notTinderedPlaylistIndex].id)).run();
            //alert(this.element.className);
          }
        }).onUp(function(){
          if(notTinderedPlaylists[notTinderedPlaylistIndex+1]){
            addTinderedPlaylist(this.element.className,"aufgeschoben");
            let emnt = this.element;
            setTimeout(function(element){
              element.parentElement.parentElement.removeChild(element.parentElement);
            },300,emnt);
            notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
            tinderSwipe.changeElement(document.getElementById("tinder-container").querySelector("."+notTinderedPlaylists[notTinderedPlaylistIndex].id)).run();
            //alert(this.element.className);
          }
        }).run();
        document.getElementById("tinder-swipe-nav").firstElementChild.addEventListener('click',function(){
          tinderSwipe.swipeRight();
        });
        document.getElementById("tinder-swipe-nav").children[1].addEventListener('click',function(){
          tinderSwipe.swipeUp();
        });
        document.getElementById("tinder-swipe-nav").children[2].addEventListener('click',function(){
          tinderSwipe.swipeLeft();
        });
      }
    }
    isTinderPageInitialized=true;
  }

  document.getElementById("tinder-container").classList.remove("invisible");
  document.getElementById("loader").classList.add("invisible");
}

/************************************************/
/*             render Categories-Page           */
/************************************************/

function renderCategoriesPage(categoryTheme){
  document.getElementById("categories-container-rbtv").classList.add("invisible");
  document.getElementById("categories-container-rbtv-gaming").classList.add("invisible");
  document.getElementById("categories-container-rbtv-non-gaming").classList.add("invisible");
  document.getElementById("categories-container-community").classList.add("invisible");
  if(categoryTheme==="gaming"){
    document.getElementById("categories-container-rbtv").classList.remove("invisible");
    document.getElementById("category-button-gaming").classList.add("category-bottom-active");
    document.getElementById("category-button-non-gaming").classList.remove("category-bottom-active");
    subCategoryTheme=["gaming"];
    subCategoryTitle="gaming";
    var categoriesContainer = document.getElementById("categories-container-rbtv-gaming");
  }else if(categoryTheme==="non-gaming"){
    document.getElementById("categories-container-rbtv").classList.remove("invisible");
    document.getElementById("category-button-non-gaming").classList.add("category-bottom-active");
    document.getElementById("category-button-gaming").classList.remove("category-bottom-active");
    subCategoryTheme=["non-gaming"];
    subCategoryTitle="non-gaming";
    var categoriesContainer = document.getElementById("categories-container-rbtv-non-gaming");
  }else if(categoryTheme==="community"){
    document.getElementById("categories-container-community").classList.remove("invisible");
    subCategoryTheme=["community"];
    subCategoryTitle="community";
    var categoriesContainer = document.getElementById("categories-container-community-all");
  }else{
    document.getElementById("categories-container-rbtv").classList.remove("invisible");
    document.getElementById("category-button-non-gaming").classList.remove("category-bottom-active");
    document.getElementById("category-button-gaming").classList.remove("category-bottom-active");
    subCategoryTheme = ["lastUpdate","publishedAt","notCategorised"];
    subCategoryTitle="last-update";
    var categoriesContainer = document.getElementById("categories-container-rbtv-last-update");
  }
  if(!isCategoriesPageInitialized.includes(subCategoryTitle)){
    initCategories(subCategoryTheme,categoriesContainer);
    isCategoriesPageInitialized.push(subCategoryTitle);
  }
  //document.getElementById("favoriten-container").style.display="none";
  //document.getElementById("single-playlist-container").style.display="none";
  //document.getElementById("tinder-container").style.display="none";
  //document.getElementById("categories-container").style.display="initial";
  document.getElementById("categories-container").classList.remove("invisible");
  categoriesContainer.classList.remove("invisible");
  document.getElementById("loader").classList.add("invisible");
}

/************************************************/
/*  render singlePlaylistPage (&video-Details)  */
/************************************************/

async function renderSinglePlaylistPage(videoHash){
  if(isSinglePlaylistPageInitialized===false){
    //initialization fuer die single-playlist-page
    activatevideoPlayerButtons();
    singlePlaylistNavProperties.activateButtons();
    singlePlaylistNavProperties.addLastUpdatedPlaylists();
    isSinglePlaylistPageInitialized=true;
  }
  if(videoHash===""){
    if(singlePlaylistId!==""){
      videoHash=singlePlaylistId;
    }else{
      try{
        videoPlayerItem = await getByPosition(0);
        videoHash=await videoPlayerItem.id;
      }catch(error){
        videoHash="PLztfM9GoCIGrhVwCfF6jsCxCteShsSjXw";
      }
    }
  }
  var playlistId=videoHash.split("&")[0];
  var videoId=videoHash.split("&")[1] || 0;
  console.log("GILT singlePlaylistId: "+singlePlaylistId+" = formatId: "+playlistId+" & videoId: "+videoId+" ?");
  if(singlePlaylistId!=videoHash){
    if(singlePlaylistId.split("&")[0]!=playlistId){
      singlePlaylistNavProperties.initRelatedPlaylists(playlistId);
      if(singlePlaylistNavProperties.alleVideosAnzeigen===true){
        var clickEvt = document.createEvent("MouseEvents");
        clickEvt.initEvent("click");
        document.getElementById("sc-show-all-div").dispatchEvent(clickEvt);
        singlePlaylistNavProperties.videosSortByOld="";
        singlePlaylistNavProperties.sortDirectionOld="";
      }
      // wenn die videoPlayerSeite neu geoeffnet wird, dann muessen ganz viele Anfragen an yt gestellt werden
      //erstmal alles wieder sauber machen
      await clearData();
      singlePlaylistNavProperties.clearAllSwipers();
      //singlePlaylistNavProperties.removeAllFromVideoTemplate();
      document.getElementById("sc-published-at-div").classList.add("invisible");
      document.getElementById("sc-view-count-div").classList.add("invisible");
      document.getElementById("sc-like-count-div").classList.add("invisible");        
      document.getElementById("sc-show-all-div").classList.add("invisible");
      
      var videoPlayerUpdated=false;
      var nextPageToken;
      var j=0;
      do{
        var event = await suchanfragePlaylistItems(playlistId,"id,snippet,contentDetails",nextPageToken);
        var playlistItems = await event.target.response.items;
        console.log(playlistItems);
        nextPageToken = await event.target.response.nextPageToken;
        var videoIds="";
        let length=await playlistItems.length;
        for(let i=0;i<length-1;i++){
          videoIds+=await playlistItems[i].contentDetails.videoId+",";
        }
        videoIds+=await playlistItems[length-1].contentDetails.videoId;
        var event2 = await suchanfrageVideos(videoIds,"id,snippet,contentDetails,statistics,player");
        var items2 = await event2.target.response.items;
        for(var i=0;i<items2.length;i++){
          add(playlistId+"&"+items2[i].id,items2[i].snippet.title,i+j,items2[i].snippet.description,items2[i].snippet.thumbnails,items2[i].snippet.channelTitle,items2[i].statistics.viewCount,items2[i].statistics.likeCount,items2[i].statistics.dislikeCount,items2[i].snippet.publishedAt,items2[i].contentDetails.duration);
        }
        //Wir erstellen die Auswahlreiter mit den ersten 50 PlaylistItems
        if(j===0){
          var itemCountOfPlaylist = parseInt(event.target.response.pageInfo.totalResults);
          if(itemCountOfPlaylist===1){
            document.getElementById("sc-item-count-div").innerHTML = "<h3>Pilotfolge</h3>";
            document.getElementById("sc-published-at-div").classList.add("invisible");
            document.getElementById("sc-view-count-div").classList.add("invisible");
            document.getElementById("sc-like-count-div").classList.add("invisible");        
            document.getElementById("sc-show-all-div").classList.add("invisible");          
          }else{
            document.getElementById("sc-item-count-div").innerHTML = "<h3>"+itemCountOfPlaylist+" Folgen</h3>" ;
            if(itemCountOfPlaylist<11){
              singlePlaylistNavProperties.alleVideosAnzeigen=false;
              document.getElementById("sc-show-all-div").classList.add("invisible");          
            }
            document.getElementById("sc-published-at-div").classList.remove("invisible");
            document.getElementById("sc-view-count-div").classList.remove("invisible");
            document.getElementById("sc-like-count-div").classList.remove("invisible");        
          }
          await singlePlaylistNavProperties.addSomeToSwipers();  
        }
        if( ( (j===0&&videoId===0) || (videoId!=0 && await videoIds.includes(videoId) ) )&&(videoPlayerUpdated===false) ){
          await updateVideoPlayer(videoHash,playlistId);
          singlePlaylistId=videoHash;
          videoPlayerUpdated=true;
          setVisibilityOfAddAndRemoveFavButton();
          // HIER SOLLTE JETZT DAS SICHTBAR UND UNSICHTBAR MACHEN DER SINGLEpLAYLISTsWIPER IN EINE EXTRA FUNKTION AUSGELAGERT WERDEN; IN DER AUCH DIE statisticContainerSwiper.setOffsetLeft(); ausgefuehrt wird
          singlePlaylistNavProperties.setVisibilityOfSinglePlaylistSwipers(itemCountOfPlaylist);
          document.getElementById("single-playlist-container").classList.remove("invisible");
          document.getElementById("loader").classList.add("invisible");
        }
          //if( singlePlaylistId.split("&")[1]==undefined){
          //  //aktualisiere den VideoPlayer
          //  await updateVideoPlayer(videoHash,playlistId);
          //  var videoPlayerUpdated=true;
          //  //document.getElementById("single-playlist-container").classList.remove("invisible");
          //  //document.getElementById("loader").classList.add("invisible");
          //}
          //await singlePlaylistNavProperties.addSomeToSwipers();
          //document.getElementById("single-playlist-container").classList.remove("invisible");
          //document.getElementById("loader").classList.add("invisible");
        j=j+50;
      }while(nextPageToken!=undefined);
      console.log("ende while");
      if(itemCountOfPlaylist>=11){
        document.getElementById("sc-show-all-div").classList.remove("invisible");
      }                
    }else{
      await updateVideoPlayer(videoHash,playlistId);  
      singlePlaylistId=videoHash;
    }
    //if( videoPlayerUpdated!=true && ((singlePlaylistId.split("&")[1]==undefined) || (singlePlaylistId.split("&")[1]!=undefined && videoId!=singlePlaylistId.split("&")[1])) ){
    //  //aktualisiere den VideoPlayer
    //  await updateVideoPlayer(videoHash,playlistId);
    //}
    //if(singlePlaylistId.split("&")[0]!=playlistId){
    //  //Hier werden die VideoLists und Swiper mit allen Videos best�ckt.
    //  //damit das funktioniert muessen wir gewisse Einstellungen, wie z.B. sortByDate, sortByLikes speichern.
    //  //changeVideoLists();
    //  console.log("vor getAll");
    //  singlePlaylistNavProperties.addAllToSwiper();
    //  console.log("FERTSCH");
    //}
  }
  console.log("singlePlaylistId: "+singlePlaylistId);
  singlePlaylistId=videoHash;
  document.getElementById("single-playlist-container").classList.remove("invisible");
  document.getElementById("loader").classList.add("invisible");
}

/********************************************************/
/*   ************************************************   */
/*   *          FAVORITEN-ZEUGS                     *   */
/*   ************************************************   */
/********************************************************/

async function sucheFavoriten2(){
  try{
    // wir holen ein Array Aller Favoriten
    var favIds = await holeFavIds();
    //console.log(favIds);
    // Wir schauen nach, welche Favoriten immer noch einen unveraenderten VideoCount haben
    // Dafuer muss die Anfrage in maximal 50 ids gesplitet werden.   
    // Wir bauen einen String bzw mehrere Strings fuer die Anfrage und fuehren die anfrage durch
    // Die Ausgabe kommt in das Array items
    var items= new Array();
    for(var i=0;i<favIds.length;i=i+50){
      var favIdsString="";
      for(var j=0;j<favIds.length-i&&j<50;j++){
        if(j<favIds.length-i-1&&j<49){
          favIdsString+=favIds[i+j]+",";
        }else{ //dh. j=favIds.length-i-1 ||j=49
          favIdsString+=favIds[i+j];
        }
      }
      //alert(favIdsString);
      event = await suchanfrageKomplett2(favIdsString,"id,player,snippet,contentDetails");

      items.push( ...event.target.response.items);    
    }
    //console.log("itemspush="+items+" Endeitemspush");
    //Wir speichern die updatebeduerftigen Daten ab und praesentieren die Daten auf der Seite
    for (var item of items){
      //console.log(item);
      var favItem = await getFavorite(item.id);
      //console.log("favItem.favLastWatchedVideoIndex: "+favItem.favLastWatchedVideoIndex+", item.contentDetails.itemCount: "+item.contentDetails.itemCount);
      //Ausgabe in nochmal ansehen.
      addToAllFavorites(item);
      //swiper.addVorschlag(item.id,   //katClass
      //       item.snippet.thumbnails.medium.url,   //thumbnail
      //       item.snippet.title,   //title
      //       item.contentDetails.itemCount,   //videoCount
      //       item.snippet.channelTitle);   //contentCreator
      if(item.contentDetails.itemCount!=favItem.favLastWatchedVideoIndex){
        //hier muss aktualisiert werden
        putFavorite(item);
        //Ausgabe in neue Favoriten Container
        var container = 'favoriten-mit-neuen-folgen-container';
        //Ausgabe
        var newVideoCount =(item.contentDetails.itemCount - favItem.favLastWatchedVideoIndex) || item.contentDetails.itemCount;
        addToFavoritePage(item.id,
                          item.snippet.thumbnails,
                          item.snippet.title,
                          item.snippet.description,
                          null, /*erstelltAm,*/
                          null, /*lastUpdate,*/ 
                          item.contentDetails.itemCount,
                          newVideoCount)
      }
    }
    //console.log("ende des Fav-hinzufuegens");    
  }catch(error){
    console.log("Ein Fehler ist aufgetreten: " + error);
  }
}

async function addToAllFavorites(item){
    var template = document.getElementById("all-favorites-template");
    var clone = document.importNode(template.content, true);
    console.log("im addToAllFavorites");
    //die Infos hinzufuegen
    clone.querySelector('img').setAttribute("src",item.snippet.thumbnails.medium.url);
    clone.querySelector('img').setAttribute("alt","Thumbnail von "+item.title);
    if (item.snippet.thumbnails.maxres===undefined) {
      if(item.snippet.thumbnails.standard===undefined){
        clone.querySelector('source').setAttribute("srcset",item.snippet.thumbnails.default.url+" 1x, "+item.snippet.thumbnails.default.url+" 1.5x, "+item.snippet.thumbnails.medium.url+" 2x, "+item.snippet.thumbnails.medium.url+" 4x, "+item.snippet.thumbnails.high.url+" 5.75x");
      }else{
        clone.querySelector('source').setAttribute("srcset",item.snippet.thumbnails.default.url+" 1x, "+item.snippet.thumbnails.default.url+" 1.5x, "+item.snippet.thumbnails.medium.url+" 2x, "+item.snippet.thumbnails.medium.url+" 4x, "+item.snippet.thumbnails.high.url+" 5.75x, "+item.snippet.thumbnails.standard.url+" 8x, "+item.snippet.thumbnails.standard.url+" 16x");
      }
    }else{
      clone.querySelector('source').setAttribute("srcset",item.snippet.thumbnails.default.url+" 1x, "+item.snippet.thumbnails.default.url+" 1.5x, "+item.snippet.thumbnails.medium.url+" 2x, "+item.snippet.thumbnails.medium.url+" 4x, "+item.snippet.thumbnails.high.url+" 5.75x, "+item.snippet.thumbnails.standard.url+" 8x, "+item.snippet.thumbnails.maxres.url+" 16x");
    }
    //die EventListener hinzufuegen
    clone.querySelector('.all-favorites-thumbnail-div').addEventListener('click',function(){window.location.hash = 'format/'+item.id});
    // Neue Zeile (row) klonen und in die Tabelle einfuegen
    document.getElementById("favoriten-ohne-neue-folgen-container").appendChild(clone);
    console.log("ende");
} //Ende addToVideoTemplate(...)

/**************** Semi-Alt ************************/
// Wird nur noch fuer den neue-Favoriten-Container ben�tigt und funktioniert nur da
async function clickToWatch(){ 
  var id = this.parentElement.className;
  console.log(id);
  putVideoCount(id);
  var db = await connectToFavoriteDB(dbName2,version2);
  var trans = db.transaction(["favoriten"],"readwrite");
  var objectStore = trans.objectStore("favoriten");
  objectStore.get(id).onsuccess = function(event) {
    var data = event.target.result;    
    data.favLastWatchedVideoIndex = data.favVideoCount;
    data.favWatchDate = Date.now(),
    //Put this updated object back into the database.
    objectStore.put(data).onsuccess = function(event) {
      //Success - the data is updated!
      console.log("Success - the data is updated!");
    };
  };
  trans.oncomplete = function(event){
    window.location.hash = 'format/'+id;
    db.close();
  };  
}

var clickToAddOrRemoveFav = function(){
  //den Vorschlag zu den Favoriten hinzufuegen, bzw. entfernen
  if(this.className==="add-to-fav"){
    addFavorite(this.name);
  }
  else{ //d.h. this.className==="add-to-fav remove-from-fav"
    removeFavorite(this.name);
  }
  //Aendere den add-to-fav-Button
  var elementsWithIdOfAdded=document.getElementsByName(this.name);
  console.log(this.name);
  for (var i=0;i<elementsWithIdOfAdded.length;i++){
    
    elementsWithIdOfAdded[i].classList.toggle("remove-from-fav");
  }
};

async function addToFavoritePage(videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount,newVideoCount){
  var template = document.getElementById("new-episode-favorite-template");
  var clone = document.importNode(template.content, true);
  //die Infos hinzufuegen
  //clone.querySelectorAll('.playlist-id').forEach(function(i){
  //  i.setAttribute("class",videoId);
  //});
  if(thumbnail.maxres!=undefined){
    clone.querySelector('source').setAttribute("srcset",thumbnail.medium.url+" 1x, "+thumbnail.maxres.url+" 4x");
  }else{
    clone.querySelector('source').setAttribute("srcset",thumbnail.medium.url+" 1x");
  }
  clone.querySelector('img').setAttribute("src",thumbnail.medium.url);
  clone.querySelector('img').setAttribute("alt","thumbnail von "+title);
  clone.querySelector('h3').innerHTML=title;
  //clone.querySelector('.published-at-div').innerHTML="&#8227 am "+erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(0, 4)+" ver&oumlffentlicht";
  //clone.querySelector('.last-update-div').innerHTML="&#8227 am "+lastUpdate.substring(8, 10)+"."+lastUpdate.substring(5, 7)+"."+lastUpdate.substring(0, 4)+" zuletzt aktualisiert";
  //clone.querySelector('.video-count').innerHTML="&#8227 "+videoCount+" Videos insgesamt";
  
  //var publishedAt = erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(0, 4);
  //var lastUpdate = lastUpdate.substring(8, 10)+"."+lastUpdate.substring(5, 7)+"."+lastUpdate.substring(0, 4);
  //clone.querySelector('.video-count').innerHTML= (videoCount===1) ? "1 Video, am "+publishedAt+"ver&oumlffentlicht" : (publishedAt===lastUpdate) ? videoCount+" Videos, am "+publishedAt+" ver&oumlffentlicht" : videoCount+" Videos, von "+publishedAt+" - "+lastUpdate+" aktiv" ;
  clone.querySelector('.video-count').innerHTML= (videoCount===1) ? "1 Video insgesamt" : (newVideoCount<videoCount&&newVideoCount>0) ? newVideoCount + " neu, " + videoCount +" Videos insgesamt" : videoCount+" Videos insgesamt" ;
  
  //die EventListener hinzufuegen
  clone.querySelector('img').addEventListener('click',function(){
    putVideoCount(videoId).then(function(){
      window.location.hash = 'format/' + videoId;
    });
    //window.location.hash = 'format/' + videoId;

  });
  clone.querySelector('h3').addEventListener('click',function(){
    putVideoCount(videoId).then(function(){
      window.location.hash = 'format/' + videoId;
    });
  });
  clone.querySelector('button').addEventListener('click',function(){
    putVideoCount(videoId).then(function(){
      window.location.hash = 'format/' + videoId;
    });
  });
  // Neue Zeile (row) klonen und in die Tabelle einfuegen
  var favoritesContainer = document.getElementById("favoriten-mit-neuen-folgen-container");
  favoritesContainer.appendChild(clone);
  console.log("ende");
}

function removeAllFromNewFavoritesContainer(){
    document.getElementById("favoriten-container").removeChild(document.getElementById("favoriten-mit-neuen-folgen-container"));
    var favoritenMitNeuenFolgenContainer = document.createElement('div');
    favoritenMitNeuenFolgenContainer.setAttribute("id","favoriten-mit-neuen-folgen-container");
    favoritenMitNeuenFolgenContainer.setAttribute("class","favoriten-container-neu");
    document.getElementById("favoriten-container").appendChild(favoritenMitNeuenFolgenContainer);
}

/****************************************************/
/*   ********************************************   */
/*   *              Tinder-Page                 *   */
/*   ********************************************   */
/****************************************************/

async function addTinderTemplateToTinderPage(videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount){
  var template = document.getElementById("tinder-template");
  var clone = document.importNode(template.content, true);
  //die Infos hinzufuegen
  clone.querySelectorAll('.playlist-id').forEach(function(i){i.setAttribute("class",videoId);});
  if(thumbnail.maxres!=undefined){
    clone.querySelector('source').setAttribute("srcset",thumbnail.medium.url+" 1x, "+thumbnail.maxres.url+" 4x");
  }else{
    clone.querySelector('source').setAttribute("srcset",thumbnail.medium.url+" 1x");
  }
  clone.querySelector('.playlist-ids').setAttribute("src",thumbnail.medium.url);
  clone.querySelector('.playlist-ids').setAttribute("alt","thumbnail von "+title);
  clone.querySelector('h3').innerHTML=title;
  //clone.querySelector('.published-at-div').innerHTML="&#8227 am "+erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(0, 4)+" ver&oumlffentlicht";
  //clone.querySelector('.last-update-div').innerHTML="&#8227 am "+lastUpdate.substring(8, 10)+"."+lastUpdate.substring(5, 7)+"."+lastUpdate.substring(0, 4)+" zuletzt aktualisiert";
  //clone.querySelector('.video-count').innerHTML="&#8227 "+videoCount+" Videos insgesamt";
  var publishedAt = erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(0, 4);
  var lastUpdate = lastUpdate.substring(8, 10)+"."+lastUpdate.substring(5, 7)+"."+lastUpdate.substring(0, 4);
  clone.querySelector('.video-count').innerHTML= (videoCount===1) ? "1 Video, am "+publishedAt+" ver&oumlffentlicht" : (publishedAt===lastUpdate) ? videoCount+" Videos, am "+publishedAt+" ver&oumlffentlicht" : videoCount+" Videos, von "+publishedAt+" - "+lastUpdate+" aktiv" ;

  //die EventListener hinzufuegen
  //clone.querySelector('.tinder-remark1').addEventListener('click',function(){
  //  window.location.hash = 'format/' + videoId;
  //});
  //clone.querySelector('.tinder-remark2').addEventListener('click',function(){
  //  window.location.hash = 'format/' + videoId;
  //});
  //clone.querySelector('.tinder-remark3').addEventListener('click',function(){
  //  window.location.hash = 'format/' + videoId;
  //});
  clone.querySelector('.picture-rahmen').addEventListener('click',function(){
    window.location.hash = 'format/' + videoId;
  },true);
  clone.querySelector('button').addEventListener('click',function(){
    window.location.hash = 'format/' + videoId;
  },true);
  // Neue Zeile (row) klonen und in die Tabelle einfuegen
  var tinderSwiper = document.getElementById("tinder-container");
  tinderSwiper.appendChild(clone);
}

async function changeTinderSwipe(tinderSwipe,videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount){
  addTinderTemplateToTinderPage(videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount)
  var tinderSwiper = document.getElementById("tinder-container");
  //HIER KONSTRUKTOR STARTEN FUER DEN START DES SWIPERS
  console.log("changeTinderSwipe Ende");
  return tinderSwipe.changeElement(tinderSwiper.querySelector("."+videoId));
}

async function createTinderSwipe(videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount){
  addTinderTemplateToTinderPage(videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount)
  var tinderSwiper = document.getElementById("tinder-container");
  //HIER KONSTRUKTOR STARTEN FUER DEN START DES SWIPERS
  console.log("changeTinderSwipe Ende");
  return new Swipe(tinderSwiper.querySelector("."+videoId));
}

//async function addToTinderSwiper(videoId,thumbnail,title,description,erstelltAm,lastUpdate,videoCount){
//  var template = document.getElementById("tinder-template");
//  var clone = document.importNode(template.content, true);
//  //die Infos hinzufuegen
//  clone.querySelectorAll('.playlist-id').forEach(function(i){i.setAttribute("class",videoId);});
//  if(thumbnail.maxres!=undefined){
//    clone.querySelector('source').setAttribute("srcset",thumbnail.medium.url+" 1x, "+thumbnail.maxres.url+" 4x");
//  }else{
//    clone.querySelector('source').setAttribute("srcset",thumbnail.medium.url+" 1x");
//  }
//  clone.querySelector('.playlist-ids').setAttribute("src",thumbnail.medium.url);
//  clone.querySelector('.playlist-ids').setAttribute("alt","thumbnail von "+title);
//  clone.querySelector('h3').innerHTML=title;
//  //clone.querySelector('.published-at-div').innerHTML="&#8227 am "+erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(0, 4)+" ver&oumlffentlicht";
//  //clone.querySelector('.last-update-div').innerHTML="&#8227 am "+lastUpdate.substring(8, 10)+"."+lastUpdate.substring(5, 7)+"."+lastUpdate.substring(0, 4)+" zuletzt aktualisiert";
//  //clone.querySelector('.video-count').innerHTML="&#8227 "+videoCount+" Videos insgesamt";
//  var publishedAt = erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(0, 4);
//  var lastUpdate = lastUpdate.substring(8, 10)+"."+lastUpdate.substring(5, 7)+"."+lastUpdate.substring(0, 4);
//  clone.querySelector('.video-count').innerHTML= (videoCount===1) ? "1 Video, am "+publishedAt+" ver&oumlffentlicht" : (publishedAt===lastUpdate) ? videoCount+" Videos, am "+publishedAt+"ver&oumlffentlicht" : videoCount+" Videos, von "+publishedAt+" - "+lastUpdate+" aktiv" ;
//
//  //die EventListener hinzufuegen
//  //clone.querySelector('.tinder-remark1').addEventListener('click',function(){
//  //  window.location.hash = 'format/' + videoId;
//  //});
//  //clone.querySelector('.tinder-remark2').addEventListener('click',function(){
//  //  window.location.hash = 'format/' + videoId;
//  //});
//  //clone.querySelector('.tinder-remark3').addEventListener('click',function(){
//  //  window.location.hash = 'format/' + videoId;
//  //});
//  clone.querySelector('.playlist-ids').addEventListener('click',function(){
//    window.location.hash = 'format/' + videoId;
//  });
//  clone.querySelector('button').addEventListener('click',function(){
//    window.location.hash = 'format/' + videoId;
//  });
//  // Neue Zeile (row) klonen und in die Tabelle einfuegen
//  var tinderSwiper = document.getElementById("tinder-container");
//  tinderSwiper.appendChild(clone);
//  //HIER KONSTRUKTOR STARTEN FUER DEN START DES SWIPERS
//  console.log(tinderSwiper.lastElementChild);
//  var tinderSwipe = new Swipe(tinderSwiper.querySelector("."+videoId));
//  //alert(tinderSwipe.element);
//  tinderSwipe.onLeft(function(evt){
//          //alert(this.element.className);
//          addTinderedPlaylist(this.element.className,"dislike");
//          setTimeout(function(element){
//            element.parentElement.parentElement.removeChild(element.parentElement);
//            notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
//            addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
//          },300,this.element);
//  });
//  tinderSwipe.onRight(function(){
//    addFavorite(this.element.className);
//    addTinderedPlaylist(this.element.className,"like");
//    setTimeout(function(element){
//    element.parentElement.parentElement.removeChild(element.parentElement);
//      notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
//      addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
//    },300,this.element);
//  });
//  tinderSwipe.onUp(function(){
//          //alert(this.element.className);
//          addTinderedPlaylist(this.element.className,"aufgeschoben");
//          setTimeout(function(element){
//            element.parentElement.parentElement.removeChild(element.parentElement);
//            notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
//            addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
//          },300,this.element);
//  });
//  tinderSwipe.run();
//  console.log("ende");
//}

/****************************************************/
/*            Tinder-Swiper                         */
/****************************************************/

class Swipe {
/*  *  *  * DER KONSTRUKTOR *  *  *  *  *  *  *  */
  constructor(element) {
    this.xDown = null; this.yDown = null;
    this.xMove = null; this.yMove = null;
    this.touchStart = null; this.touchStartTime = null; this.swipe = null;
    this.element = (typeof(element) === 'string') ? document.querySelector(element) : element;
    this.elementLeft = this.element.offsetLeft;
    this.element.style.left = this.elementLeft;
    this.elementTop = this.element.offsetTop;
    this.element.style.top = this.elementTop;
  }
  changeElement(element){
    this.element=element;
    this.xDown = null; this.yDown = null;
    this.xMove = null; this.yMove = null;
    this.touchStart = null; this.touchStartTime = null; this.swipe = null;
    this.elementLeft = this.element.offsetLeft;
    this.element.style.left = this.elementLeft;
    this.elementTop = this.element.offsetTop;
    this.element.style.top = this.elementTop;
    return this;
  }

/*  *  *  * WEITERE SWIPE-OPERATIONEN BINDEN *  *  *  *  *  *  *  */
  onLeft(callback) {this.onLeft = callback; return this;}
  onRight(callback) {this.onRight = callback; return this;}
  onUp(callback) {this.onUp = callback; return this;}
  onDown(callback) {this.onDown = callback; return this;}
  onRun(callback) {this.onRun = callback; return this;}
/*  *  *  * SWIPE-Functions *  *  *  *  *  *  *  */
  swipeLeft(){
    this.element.style.transitionDuration="0.3s";
    var xl = this.element.offsetWidth;
    var yl = this.element.offsetHeight;
    //var li = this.infos.firstElementChild.offsetWidth;
    var x = this.elementLeft+Math.round((-this.xDown+this.xMove)/xl)*xl;
    var y = this.elementTop+Math.round((-this.yDown+this.yMove)/yl)*yl;
    this.element.style.left = this.elementLeft-xl+"px"; this.elementLeft = this.elementLeft-xl;
    //HIER DISLIKEN
    this.onLeft();
  }
  swipeRight(){
    this.element.style.transitionDuration="0.3s";
    var xl = this.element.offsetWidth;
    var x = this.elementLeft+Math.round((-this.xDown+this.xMove)/xl)*xl;
    this.element.style.left = this.elementLeft+xl+"px";
    this.onRight();
  }
  swipeUp(){
    this.element.style.transitionDuration="0.3s";
    var xl = this.element.offsetWidth;
    var yl = this.element.offsetHeight;
    //var li = this.infos.firstElementChild.offsetWidth;
    var x = this.elementLeft+Math.round((-this.xDown+this.xMove)/xl)*xl;
    var y = this.elementTop+Math.round((-this.yDown+this.yMove)/yl)*yl;
    this.element.style.top = this.elementTop-this.element.offsetHeight+"px"; this.elementTop = this.elementTop-this.element.offsetHeight;
    //HIER AUFGESCHOBEN
    this.onUp();
  }

/*  *  *  * TOUCHSTART-HANDLER *  *  *  *  *  *  *  */
  handleTouchStart(evt) {
    this.xDown = evt.touches[0].clientX; this.yDown = evt.touches[0].clientY; //Set values.
    this.touchStart = true; this.touchStartTime = Date.now(); //Set values.
    //alert(this.touchStart);
  }
/*  *  *  * TOUCHMOVE-HANDLER *  *  *  *  *  *  *  */
  handleTouchMove(evt) {
    this.xMove = evt.changedTouches.item(0).clientX; this.yMove = evt.changedTouches[0].clientY; //Set values.
    if(this.touchStart === true &&  Math.abs(this.xDown - this.xMove) != 0){ // Most significant.
      this.swipe = true;
    }
    if(this.swipe === true){
      evt.preventDefault();
      this.element.style.transitionDuration="0s";
      //this.infos.style.transitionDuration="0s";
      this.element.style.left = this.elementLeft-this.xDown+this.xMove+"px";
      //this.element.style.top = -this.yDown+this.yMove+"px";
      this.element.style.top = this.elementTop-this.yDown+this.yMove+"px";
      //alert(this.element.style.left);
      if (Math.abs(-this.yDown+this.yMove)>Math.abs(-this.xDown+this.xMove)){
        document.querySelector('.tinder-remark1').style.opacity = -3*(-this.yDown+this.yMove)/this.element.offsetHeight;
        document.querySelector('.tinder-remark2').style.opacity = 0;
        document.querySelector('.tinder-remark3').style.opacity = 0;
      }else{
        document.querySelector('.tinder-remark1').style.opacity = 0;
        document.querySelector('.tinder-remark2').style.opacity = -3*(-this.xDown+this.xMove)/this.element.offsetWidth;
        document.querySelector('.tinder-remark3').style.opacity = 3*(-this.xDown+this.xMove)/this.element.offsetWidth;
      }
    }
    this.touchStart = false; //Reset values.
  }
/*  *  *  * TOUCHEND-HANDLER *  *  *  *  *  *  *  */
  handleTouchEnd(evt) {
    if(this.swipe === true){
      this.touchEndTime = Date.now();
      this.element.style.transitionDuration="0.3s";
      var xl = this.element.offsetWidth;
      var yl = this.element.offsetHeight;
      //var li = this.infos.firstElementChild.offsetWidth;
      var x = this.elementLeft+Math.round((-this.xDown+this.xMove)/xl)*xl;
      var y = this.elementTop+Math.round((-this.yDown+this.yMove)/yl)*yl;
      //var y = this.infosLeft+Math.round((-this.xDown+this.xMove)/lt)*this.infos.firstElementChild.offsetWidth;
      //var rest = (this.elementLeft%xl>=0) ? this.elementLeft%xl : this.elementLeft%xl+xl;
      if(Math.abs(-this.xDown+this.xMove)>=Math.abs(-this.yDown+this.yMove)){ //dh. zur Seite geswipet
        if( (Math.round((-this.xDown+this.xMove)/xl)>=1) || (this.xMove-this.xDown)/(this.touchEndTime-this.touchStartTime)>xl/1000 /*&& this.elementLeft+xl<=rest*/){
          this.element.style.left = this.elementLeft+xl+"px"; this.elementLeft = this.elementLeft+xl;
          //HIER LIKEN
          //alert(this.element.className);
          this.onRight();
          //addFavorite(this.element.className);
          //addTinderedPlaylist(this.element.className,"like");
          //setTimeout(function(element){
          //  element.parentElement.parentElement.removeChild(element.parentElement);
          //  notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
          //  addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
          //},300,this.element);
        }else if( (Math.round((-this.xDown+this.xMove)/xl)<=-1) || (this.xMove-this.xDown)/(this.touchEndTime-this.touchStartTime)<-xl/1000 /*&& this.elementLeft-xl>-(this.element.children.length-1)*xl*/){
          this.element.style.left = this.elementLeft-xl+"px"; this.elementLeft = this.elementLeft-xl;
          //HIER DISLIKEN
          this.onLeft();
          //alert(this.element.className);
          //addTinderedPlaylist(this.element.className,"dislike");
          //setTimeout(function(element){
          //  element.parentElement.parentElement.removeChild(element.parentElement);
          //  notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
          //  addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
          //},300,this.element);
        }else{ //dh. Math.round((-this.xDown+this.xMove)/xl)===0 && Swipe-Geschindigkeit in x-Richtung = klein
          this.element.style.left = x+"px"; //this.elementLeft = x;
          this.element.style.top = this.elementTop+"px"; //this.elementTop = this.elementTop;
          document.querySelector('.tinder-remark1').style.opacity = 0;
          document.querySelector('.tinder-remark2').style.opacity = 0;
          document.querySelector('.tinder-remark3').style.opacity = 0;
          //HIER IST ALLES ZURUECK AUF ANFANG
        }
      }else{ //dh. eher nach oben geschoben
        if( (Math.round((-this.yDown+this.yMove)/yl)<0) || (Math.round((-this.yDown+this.yMove)/yl)===0) && (this.yMove-this.yDown)/(this.touchEndTime-this.touchStartTime)<-yl/1000 /*&& this.elementLeft-yl>-(this.element.children.length-1)*yl*/ ){
          this.element.style.left = x+"px"; //this.elementLeft = x;
          //this.element.style.top = -this.element.offsetHeight+"px"; this.elementTop = this.elementTop-this.element.offsetHeight;
          this.element.style.top = this.elementTop-this.element.offsetHeight+"px"; this.elementTop = this.elementTop-this.element.offsetHeight;
          //HIER AUFGESCHOBEN
          this.onUp();
          //alert(this.element.className);
          //addTinderedPlaylist(this.element.className,"aufgeschoben");
          //setTimeout(function(element){
          //  element.parentElement.parentElement.removeChild(element.parentElement);
          //  notTinderedPlaylistIndex=notTinderedPlaylistIndex+1;
          //  addToTinderSwiper(notTinderedPlaylists[notTinderedPlaylistIndex].id,notTinderedPlaylists[notTinderedPlaylistIndex].thumbnails,notTinderedPlaylists[notTinderedPlaylistIndex].title,notTinderedPlaylists[notTinderedPlaylistIndex].description,notTinderedPlaylists[notTinderedPlaylistIndex].publishedAt,notTinderedPlaylists[notTinderedPlaylistIndex].lastUpdate,notTinderedPlaylists[notTinderedPlaylistIndex].itemCount);
          //},300,this.element);
        }else{
          this.element.style.left = x+"px"; //this.elementLeft = x;
          //this.element.style.top = "0px"; //this.elementTop = this.elementTop;
          this.element.style.top = this.elementTop+"px"; //this.elementTop = this.elementTop;
          document.querySelector('.tinder-remark1').style.opacity = 0;
          document.querySelector('.tinder-remark2').style.opacity = 0;
          document.querySelector('.tinder-remark3').style.opacity = 0;
          //HIER IST ALLES ZURUECK AUF ANFANG
        }
      }
    }
    this.xDown = null; this.yDown = null; this.xMove = null; this.yMove = null; //Reset values.
    this.swipe = null; this.touchStart = null; //Reset values.
  }
/*  *  *  * CLICK-HANDLER *  *  *  *  *  *  *  */
  async handleClick(evt){
    //click auf den Rand zum swipen
    //var rest = (this.thumbnailsLeft%lt>=0) ? this.thumbnailsLeft%lt : this.thumbnailsLeft%lt+lt;
    //if(evt.clientX<rest){
    //  if(this.infosLeft<0){ //hier müssen die Randbedingungen noch angepasst werden
    //    this.thumbnails.style.transitionDuration="0.5s"; this.infos.style.transitionDuration="0.5s";
    //    this.thumbnails.style.left = this.thumbnailsLeft+lt+"px"; this.infos.style.left = this.infosLeft+this.infos.firstElementChild.offsetWidth+"px";
    //    this.thumbnailsLeft = this.thumbnailsLeft+lt; this.infosLeft = this.infosLeft+this.infos.firstElementChild.offsetWidth;
    //  }
    //}else if (evt.clientX>this.element.offsetWidth+rest-this.element.offsetWidth%lt){
    //  if(this.infosLeft+(this.infos.children.length-1)*this.infos.firstElementChild.offsetWidth>0){
    //    this.thumbnails.style.transitionDuration="0.5s"; this.infos.style.transitionDuration="0.5s";
    //    this.thumbnails.style.left = this.thumbnailsLeft-lt+"px"; this.infos.style.left = this.infosLeft-this.infos.firstElementChild.offsetWidth+"px";
    //    this.thumbnailsLeft = this.thumbnailsLeft-lt; this.infosLeft = this.infosLeft-this.infos.firstElementChild.offsetWidth;
    //  }
    //}
    //click auf das Thumbnail zum swipen
/*    var lt = this.thumbnails.firstElementChild.offsetWidth;
    var rest = (this.thumbnailsLeft%lt>=0) ? this.thumbnailsLeft%lt : this.thumbnailsLeft%lt+lt;
    if(evt.clientX<rest && (evt.target.tagName.toLowerCase()==='img' || evt.target.className==='thumbnail')){
      if(this.infosLeft<0){
      //if(this.thumbnailsLeft+evt.target.offsetLeft<0){
        this.thumbnails.style.transitionDuration="0.5s"; this.infos.style.transitionDuration="0.5s";
        this.thumbnails.style.left = this.thumbnailsLeft+lt+"px"; this.infos.style.left = this.infosLeft+this.infos.firstElementChild.offsetWidth+"px";
        this.thumbnailsLeft = this.thumbnailsLeft+lt; this.infosLeft = this.infosLeft+this.infos.firstElementChild.offsetWidth;
      }
    }
    else if( evt.clientX>this.element.offsetWidth+rest-this.element.offsetWidth%lt && (evt.target.tagName.toLowerCase()==='img' || evt.target.className==='thumbnail')){
      if(this.infosLeft+(this.infos.children.length-1)*this.infos.firstElementChild.offsetWidth>0){
      //if(this.thumbnailsLeft+evt.target.offsetLeft+evt.target.offsetWidth>=this.element.offsetWidth){
        this.thumbnails.style.transitionDuration="0.5s"; this.infos.style.transitionDuration="0.5s";
        this.thumbnails.style.left = this.thumbnailsLeft-lt+"px"; this.infos.style.left = this.infosLeft-this.infos.firstElementChild.offsetWidth+"px";
        this.thumbnailsLeft = this.thumbnailsLeft-lt; this.infosLeft = this.infosLeft-this.infos.firstElementChild.offsetWidth;
      }
    }
    //click auf das Thumbnail zum Anschauen UND Click auf mehr-anzeigen-Button
    else if( (evt.target.tagName.toLowerCase()==='img' && this.thumbnailsLeft+evt.target.offsetLeft>=0 && this.thumbnailsLeft+evt.target.offsetLeft+evt.target.offsetWidth<this.element.offsetWidth) || (evt.target.tagName.toLowerCase()==='button' && evt.target.className==="mehr")){
      var id = ( evt.target.tagName.toLowerCase()==='img' ) ? evt.target.className : evt.target.name;
      localStorage.setItem('format',id);
      var db = await connectToDB(dbName,version);
      var trans = db.transaction(["favoriten"],"readwrite");
      var objectStore = trans.objectStore("favoriten");
      objectStore.get(id).onsuccess = function(event) {
        if(event.target.result!=undefined){
          var data = event.target.result;
          data.favWatchDate = Date.now(),
          data.favLastWatchedVideoIndex = data.favVideoCount;
          //Put this updated object back into the database.
          objectStore.put(data).onsuccess = function(event) {
            //Success - the data is updated!
            console.log("Success - the data is updated!");
          };
        }
      };
      trans.oncomplete = function(event){
        window.location = "video.html"
        db.close();
      };
    }
    // Click auf add/remove-fav-Button
    else if(evt.target.tagName.toLowerCase()==='button' && (evt.target.className==="add-to-fav" || evt.target.className==="add-to-fav remove-from-fav") ){
      if(evt.target.className==="add-to-fav"){ add(evt.target.name); }
      else{ remove(evt.target.name); }
      //Aendere alle add-to-fav-Button mit selben Namen
      var ButtonsWithNameOfTarget=document.getElementsByName(evt.target.name);
      for (var i=0;i<ButtonsWithNameOfTarget.length;i++){
        ButtonsWithNameOfTarget[i].classList.toggle("remove-from-fav");
      }
    }
*/
  }
/*  *  *  * DIE RUN-METHODE *  *  *  *  *  *  *  */
  run() {
    this.element.addEventListener('touchstart', function(evt) {
      this.handleTouchStart(evt);
    }.bind(this), false);
    this.element.addEventListener('touchmove', function(evt) {
      this.handleTouchMove(evt);
    }.bind(this),false);
    this.element.addEventListener('touchend', function(evt) {
      this.handleTouchEnd(evt);
    }.bind(this),false);
    this.element.addEventListener('click', function(evt) {
      this.handleClick(evt);
    }.bind(this),false);
    this.onRun();
  }
}


/****************************************************/
/*   ********************************************   */
/*   *       Categories Page                    *   */
/*   ********************************************   */
/****************************************************/

function initCategories(subCategoryTheme,categoriesContainer){
  var categories = getCategories("related",subCategoryTheme);
  categories.forEach(function(category){
    var template = document.getElementById("swipe-container-nav-template");
    var clone = document.importNode(template.content, true);
    //die Infos hinzufuegen
    clone.querySelector('h3').innerHTML=category.categoryName;
    // Neue Zeile (row) klonen und in die Tabelle einfuegen
    categoriesContainer.appendChild(clone);

    var categoryDiv = document.createElement('div');
    categoryDiv.setAttribute("class","category-swipe-container");
    categoriesContainer.appendChild(categoryDiv);

    //var categorySwiper = new CategorySwiper(categoryDiv);
    //categorySwiper.run();

    category.categoryItems.forEach(function(item){
      addToCategoryTemplate(item,categoryDiv);
      //categorySwiper.addVorschlag(item.id,item.thumbnails.medium.url,item.title,item.itemCount,item.channelTitle,item);
    });
  });
}

async function addToCategoryTemplate(item,container){
    var template = document.getElementById("category-template");
    var clone = document.importNode(template.content, true);
    console.log("im addToCategoryTemplate");
    //die Infos hinzufuegen
    clone.querySelector('img').setAttribute("src",item.thumbnails.medium.url);
    clone.querySelector('img').setAttribute("alt","Thumbnail von "+item.title);
    if (item.thumbnails.maxres===undefined) {
      if (item.thumbnails.standard===undefined) {
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x");
      }else{
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x, "+item.thumbnails.standard.url+" 4x");
      }
    }else{
      if (item.thumbnails.standard===undefined) {
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x, "+item.thumbnails.maxres.url+" 8x");
      }else{
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x, "+item.thumbnails.standard.url+" 4x, "+item.thumbnails.maxres.url+" 8x");
      }
    }

    var erstelltAm=item.publishedAt;
    var publishedAt=erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(2, 4);
    var zuletztAktualisiert=item.lastUpdate;
    var lastUpdate=zuletztAktualisiert.substring(8, 10)+"."+zuletztAktualisiert.substring(5, 7)+"."+zuletztAktualisiert.substring(2, 4);
    clone.querySelector('.info-div').children[0].innerHTML= (item.itemCount===1) ? "1 Video" : item.itemCount+" Videos" ;
    clone.querySelector('.info-div').children[1].innerHTML=(item.itemCount===1 || publishedAt===lastUpdate) ? "am "+publishedAt+" ver\u00f6ffentlicht" : publishedAt+" - "+lastUpdate;
    clone.querySelector('h5').innerHTML=item.title;
    clone.querySelector('#add-and-remove-fav-div').setAttribute("name",item.id);
    if(await getFavorite(item.id)){
      clone.querySelector('#add-and-remove-fav-div').classList.toggle("remove-from-fav");
    }
    //die EventListener hinzuf�gen
    clone.querySelector('.thumbnail-div').addEventListener('click',function(){window.location.hash = 'format/'+item.id});
    clone.querySelector('.title-div').addEventListener('click',function(){window.location.hash = 'format/'+item.id});

    // Click auf add/remove-fav-Button
    clone.querySelector('button').addEventListener('click',function(evt){
      if(evt.target.className==="add-to-fav"){ addFavorite(item.id); }
      else{ removeFavorite(item.id); }
      //Aendere alle add-to-fav-Button mit selben Namen
      var ButtonsWithNameOfTarget=document.getElementsByName(item.id);
      for (var i=0;i<ButtonsWithNameOfTarget.length;i++){
        ButtonsWithNameOfTarget[i].classList.toggle("remove-from-fav");
      }
    });
    // Neue Zeile (row) klonen und in die Tabelle einf�gen
    container.appendChild(clone);
    console.log("ende");
} //Ende addToCategoryTemplate(...)


/****************************************************/
/*   ********************************************   */
/*   *  Video Player     Single Playlist Page   *   */
/*   ********************************************   */
/****************************************************/

/*************************************************/
/*           videoPlayer                         */
/*************************************************/

function activatevideoPlayerButtons(){
  activateDescriptionButton();
  activateAddToFavButton();
  activateRemoveFromFavButton();
}

function activateDescriptionButton(){
  document.getElementById("show-description-div").addEventListener("click", function(){
    document.getElementById("description-div").classList.toggle("invisible");
  });
}

function activateAddToFavButton(){
  document.getElementById("add-to-fav-div").addEventListener("click",async function(){
    await addFavorite(singlePlaylistId.split("&")[0]);
    setVisibilityOfAddAndRemoveFavButton();
    //Aendere den add-to-fav-Button in der Favoriten-Page
    var ElementsWithIdOfAdded=document.getElementsByName(this.name);
    for (var i=0;i<ElementsWithIdOfAdded.length;i++){
      ElementsWithIdOfAdded[i].classList.add("remove-from-fav");
    }
  });
};

function activateRemoveFromFavButton(){
  document.getElementById("remove-from-fav-div").addEventListener("click",async function(){
    await removeFavorite(singlePlaylistId.split("&")[0]);
    setVisibilityOfAddAndRemoveFavButton();
    //Aendere den add-to-fav-Button in der Favoriten-Page
    var ElementsWithIdOfAdded=document.getElementsByName(this.name);
    for (var i=0;i<ElementsWithIdOfAdded.length;i++){
      ElementsWithIdOfAdded[i].classList.remove("remove-from-fav");
    }
  });
};

async function setVisibilityOfAddAndRemoveFavButton(){
  if(singlePlaylistId.split("&")[0]!==""){
    if(await getFavorite(singlePlaylistId.split("&")[0])){
      document.getElementById("add-to-fav-div").classList.add("invisible");
      document.getElementById("remove-from-fav-div").classList.remove("invisible");
    }else{
      document.getElementById("add-to-fav-div").classList.remove("invisible");
      document.getElementById("remove-from-fav-div").classList.add("invisible");
    }
  }else{
    document.getElementById("add-to-fav-div").classList.add("invisible");
    document.getElementById("remove-from-fav-div").classList.add("invisible");
  }
}

async function updateVideoPlayer(videoHash,playlistId){
      var videoPlayerItem = (await get(videoHash)!=undefined) ? await get(videoHash) : await getByPosition(0);
      console.log("videoPlayerItem="+videoPlayerItem); //get item by position 0, wenn keine VideoId gegeben ist, bzw get Item by videoId sonst
      //Wir bauen das IFRAME <iframe id="videoFrame" width="360" height="202" src="https://www.youtube-nocookie.com/embed/jYiQuEQriaI" frameborder="0" allowfullscreen></iframe>
      var element = document.getElementById("videoFrame");
      if (element){
        element.parentNode.removeChild(element);
      }
      var videoFrame = document.createElement('iframe');
      videoFrame.setAttribute("id","videoFrame");
      //videoFrame.setAttribute("width",360);
      //videoFrame.setAttribute("height",202);
      videoFrame.setAttribute("allowFullScreen","");
      videoFrame.setAttribute("src","https://www.youtube-nocookie.com/embed/"+videoPlayerItem.id.split("&")[1]+"?list="+playlistId.split("&")[0]/*+"?enablejsapi=1"*/);
      videoFrame.setAttribute("frameborder",0);
      document.getElementById("single-video-content").insertAdjacentElement("afterBegin", videoFrame);
      document.querySelector('#title-h').innerHTML=videoPlayerItem.title;
      ////Wir laden das iframe ohne bauen
      //var videoFrame = document.getElementById("videoFrame");
      //videoFrame.setAttribute("width",360);
      //videoFrame.setAttribute("height",202);
      //videoFrame.setAttribute("src","https://www.youtube-nocookie.com/embed/"+videoPlayerItem.id.split("&")[1]+"?list="+playlistId.split("&")[0]);

      var erstelltAm=videoPlayerItem.publishedAt;
      var publishedAt=erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(2, 4);
      var duration="";
      var dauer=videoPlayerItem.duration.split("T")[1].split("H");
      if(dauer.length===1){ dauer=dauer[0]; }
      else{ duration=dauer[0]+":"; dauer=dauer[1]; }
      dauer=dauer.split("M");
      if(dauer.length===1){
        duration+="00:";
        dauer=dauer[0];
      }else{
        duration+= (parseInt(dauer[0])<10) ? "0"+dauer[0]+":" : dauer[0]+":";
        dauer=dauer[1];
      }
      dauer=dauer.split("S");
      if(dauer.length===1){
        duration+="00";
        dauer=dauer[0];
      }else{
        duration+= (parseInt(dauer[0])<10) ? "0"+dauer[0] : dauer[0];
      }
      document.querySelector('#sv-published-at-div').innerHTML=publishedAt;
      document.querySelector('#sv-duration-div').innerHTML=duration;
      document.querySelector('#sv-view-count-div').innerHTML=videoPlayerItem.viewCount+" Aufrufe";
      document.querySelector('#sv-like-count-div').innerHTML=videoPlayerItem.likeCount+" Likes";
      document.querySelector('#description-div').innerHTML="Von "+ videoPlayerItem.channelTitle +" ver\u00f6ffentlicht. <br/> "+videoPlayerItem.description;
      var videoLink = "https://www.youtube.com/watch?v="+videoPlayerItem.id.split("&")[1]+"&list="+playlistId;
      switch(getMobileOperatingSystem()){
               case 'Android':
                    videoLink = "vnd.youtube://www.youtube.com/watch?v="+videoPlayerItem.id.split("&")[1]+"&list="+playlistId;
                    break;
               case 'iOS':
                    videoLink = "youtube://www.youtube.com/watch?v="+videoPlayerItem.id.split("&")[1]+"&list="+playlistId;
                    break;
               default:
                    break;
      }
      document.getElementById("open-YT-App").setAttribute('href', videoLink);
}

/************************************************/
/*             zur YT-APP verlinken             */
/************************************************/

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) ){
    return 'iOS';
  }else if( userAgent.match( /Android/i ) ){
    return 'Android';
  }else{
    return 'unknown';
  }
}

/*****************************************/
/*     singlePlaylistNav & -Swipers      */
/*****************************************/

var singlePlaylistNavProperties = {
  alleVideosAnzeigen: false, //ist fuer das anzeigen der vorgeschlagenen Videos in der singlePlaylistPage. moegliche Werte true und false
  videosSortBy: "likeCount", //ist fuer das sortieren der vorgeschlagenen Videos in der singlePlaylistPage. Moegliche Werte: "viewCount" "likeCount" "position" "publishedAt"
  sortDirection: "down", //Gibt die Reihenfolge der vorgeschlagenen Videos in der singlePlaylistPage an. Moegliche Werte: "up", "down";

  activateButtons: function(){
    document.getElementById("sc-show-all-div").addEventListener("click", function(){
      if (this.alleVideosAnzeigen===false){
        this.alleVideosAnzeigen=true;
        document.getElementById("sc-show-all-div").innerHTML = "Auswahl anzeigen";
      }
      else{
        this.alleVideosAnzeigen=false; 
        this.alleVideosAnzeigenOld=this.alleVideosAnzeigen;
        this.videosSortByOld=this.videosSortBy;
        this.sortDirectionOld=this.sortDirection;
        document.getElementById("sc-show-all-div").innerHTML = "Alle anzeigen";
      }
      if( this.alleVideosAnzeigen===true && (this.videosSortByOld!=this.videosSortBy||this.sortDirectionOld!=this.sortDirection) ){
        this.addAllToSwiper();
      }
      this.setVisibilityOfSinglePlaylistSwipers();
    }.bind(this));
    document.getElementById("sc-published-at-div").addEventListener("click", function(){
      if(this.videosSortBy!="position" || this.sortDirection==="up"){
        this.sortDirection="down";
        document.getElementById("sc-published-at-div").style.backgroundImage="url(\"./img/positionDown.svg\")";
      }
      else{
        this.sortDirection="up";
        document.getElementById("sc-published-at-div").style.backgroundImage="url(\"./img/positionUp.svg\")";
      }
      if (document.getElementById("sc-view-count-div").style.backgroundImage!=="url(\"./img/views.svg\")"){
        document.getElementById("sc-view-count-div").style.backgroundImage="url(\"./img/views.svg\")";
      }
      if (document.getElementById("sc-like-count-div").style.backgroundImage!=="url(\"./img/likes.svg\")"){
        document.getElementById("sc-like-count-div").style.backgroundImage="url(\"./img/likes.svg\")";
      }
      this.videosSortBy="position";
      if(this.alleVideosAnzeigen===true){
        this.addAllToSwiper();
      }
      this.setVisibilityOfSinglePlaylistSwipers();
    }.bind(this));
    document.getElementById("sc-view-count-div").addEventListener("click", function(){
      if(this.videosSortBy!="viewCount" || this.sortDirection==="up"){
        this.sortDirection="down";
        document.getElementById("sc-view-count-div").style.backgroundImage="url(\"./img/viewsDown.svg\")";
      }
      else{
        this.sortDirection="up";
        document.getElementById("sc-view-count-div").style.backgroundImage="url(\"./img/viewsUp.svg\")";
      }
      if (document.getElementById("sc-like-count-div").style.backgroundImage!=="url(\"./img/likes.svg\")"){
        document.getElementById("sc-like-count-div").style.backgroundImage="url(\"./img/likes.svg\")";
      }
      if (document.getElementById("sc-published-at-div").style.backgroundImage!=="url(\"./img/position.svg\")"){
        document.getElementById("sc-published-at-div").style.backgroundImage="url(\"./img/position.svg\")";
      }
      this.videosSortBy="viewCount";
      if(this.alleVideosAnzeigen===true){
        this.addAllToSwiper();
      }
      this.setVisibilityOfSinglePlaylistSwipers();
    }.bind(this));
    document.getElementById("sc-like-count-div").addEventListener("click", function(){
      if(this.videosSortBy!="likeCount" || this.sortDirection==="up"){
        this.sortDirection="down";
        document.getElementById("sc-like-count-div").style.backgroundImage="url(\"./img/likesDown.svg\")";
      }
      else{
        this.sortDirection="up";
        document.getElementById("sc-like-count-div").style.backgroundImage="url(\"./img/likesUp.svg\")";
      }
      if (document.getElementById("sc-view-count-div").style.backgroundImage!=="url(\"./img/views.svg\")"){
        document.getElementById("sc-view-count-div").style.backgroundImage="url(\"./img/views.svg\")";
      }
      if (document.getElementById("sc-published-at-div").style.backgroundImage!=="url(\"./img/position.svg\")"){
        document.getElementById("sc-published-at-div").style.backgroundImage="url(\"./img/position.svg\")";
      }
      this.videosSortBy="likeCount";
      if(this.alleVideosAnzeigen===true){
        this.addAllToSwiper();
      }
      this.setVisibilityOfSinglePlaylistSwipers();
    }.bind(this));
  },//Ende activateButtons()

  clearAllSwipers: function(){
    var singlePlaylistContent = document.getElementById("single-playlist-content")
    var videoLists = ["video-list-auswahl-position","video-list-auswahl-position-invers","video-list-auswahl-views","video-list-auswahl-views-invers",
                      "video-list-auswahl-likes","video-list-auswahl-likes-invers","video-list"];
    videoLists.forEach(function(videoList){
      singlePlaylistContent.removeChild(document.getElementById(videoList));  
      var newVideoList = document.createElement('div');
      if(videoList==="video-list"){
        newVideoList.setAttribute("class","swipe-container-all");
      }else{
        newVideoList.setAttribute("class","swipe-container");
      }
      newVideoList.setAttribute("id",videoList);
      document.getElementById("single-playlist-content").appendChild(newVideoList);
    });
  },//Ende clearAllSwipers()

  removeAllFromVideoTemplate: function(){
    document.getElementById("single-playlist-content").removeChild(document.getElementById("video-list"));
    var videoList = document.createElement('div');
    videoList.setAttribute("id","video-list");
    videoList.setAttribute("class","swipe-container-all");
    document.getElementById("single-playlist-content").appendChild(videoList);
  },//Ende removeAllFromVideoTemplate()

  addToVideoTemplate: async function(item,containerId){
    var template = document.getElementById("video-template-new");
    var clone = document.importNode(template.content, true);
    console.log("im addToVideoTemplate");
    //die Infos hinzufuegen
    clone.querySelector('img').setAttribute("src",item.thumbnails.medium.url);
    clone.querySelector('img').setAttribute("alt","Thumbnail von "+item.title);
    if (item.thumbnails.maxres===undefined) {
      if (item.thumbnails.standard===undefined) {
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x");
      }else{
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x, "+item.thumbnails.standard.url+" 4x");
      }
    }else{
      if (item.thumbnails.standard===undefined) {
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x, "+item.thumbnails.maxres.url+" 8x");
      }else{
        clone.querySelector('source').setAttribute("srcset",item.thumbnails.medium.url+" 1x, "+item.thumbnails.medium.url+" 2x, "+item.thumbnails.high.url+" 3x, "+item.thumbnails.standard.url+" 4x, "+item.thumbnails.maxres.url+" 8x");
      }
    }
        var erstelltAm=item.publishedAt;
        var publishedAt=erstelltAm.substring(8, 10)+"."+erstelltAm.substring(5, 7)+"."+erstelltAm.substring(2, 4);
        var duration="";
        var dauer=item.duration.split("T")[1].split("H");
        if(dauer.length===1){ dauer=dauer[0]; }
        else{ duration=dauer[0]+":"; dauer=dauer[1]; }
        dauer=dauer.split("M");
        if(dauer.length===1){
          duration+="00:";
          dauer=dauer[0];
        }else{
          duration+= (parseInt(dauer[0])<10) ? "0"+dauer[0]+":" : dauer[0]+":";
          dauer=dauer[1];
        }
        dauer=dauer.split("S");
        if(dauer.length===1){
          duration+="00";
          dauer=dauer[0];
        }else{
          duration+= (parseInt(dauer[0])<10) ? "0"+dauer[0] : dauer[0];
        }
    clone.querySelector('.published-at').innerHTML = "am "+publishedAt+" ver\u00f6ffentlicht";
    clone.querySelector('.duration').innerHTML = duration;
    clone.querySelector('.view-count').innerHTML = item.viewCount+" Views";
    clone.querySelector('.like-count').innerHTML = item.likeCount+" Likes";


    clone.querySelector('h5').innerHTML=item.title;
  
    //die EventListener hinzufuegen
    clone.querySelector('.thumbnail-div').addEventListener('click',function(){window.location.hash = 'format/'+item.id});
    clone.querySelector('.title-div').addEventListener('click',function(){window.location.hash = 'format/'+item.id});
    // Neue Zeile (row) klonen und in die Tabelle einf�gen
  
    document.getElementById(containerId).appendChild(clone);
    console.log("ende");
  }, //Ende addToVideoTemplate(...)

  addSomeToSwipers: function(){
           var videoLists = ["video-list-auswahl-position","video-list-auswahl-position-invers","video-list-auswahl-views","video-list-auswahl-views-invers",
                             "video-list-auswahl-likes","video-list-auswahl-likes-invers"];
           videoLists.forEach(async function(videoList,index){
             switch(index) {
               case 0:
                   var sortedItems = await getSome(10);
                   break;
               case 1:
                   var sortedItems = await getSome(10,"position","prev");
                   break;
               case 2:
                   var sortedItems = await getSome(10,"viewCount","prev");
                   break;
               case 3:
                   var sortedItems = await getSome(10,"viewCount");
                   break;
               case 4:
                   var sortedItems = await getSome(10,"likeCount","prev");
                   break;
               case 5:
                   var sortedItems = await getSome(10,"likeCount");
                   break;
               default:
                   break;
             } 
             for(var i in sortedItems){
               singlePlaylistNavProperties.addToVideoTemplate(sortedItems[i],videoList);
             }
           });
  },//Ende addSomeToSwipers()

  addAllToSwiper: async function(){
      if(this.alleVideosAnzeigen===true){
        singlePlaylistNavProperties.removeAllFromVideoTemplate();
        var direction = ( (this.sortDirection==="down"&&this.videosSortBy!=="position") || (this.sortDirection==="up"&&this.videosSortBy==="position") ) ? "prev" : "next" ;
        var sortedItems = await getAll(this.videosSortBy,direction);
        for(var i in sortedItems){
          singlePlaylistNavProperties.addToVideoTemplate(sortedItems[i],"video-list");
        }
      }
      //var itemsSortByDate = await getAll("position","next");
      //for(var i in itemsSortByDate){
      //  addToVideoTemplate(itemsSortByDate[i].id,
      //                 itemsSortByDate[i].thumbnails,
      //                 itemsSortByDate[i].title,
      //                 itemsSortByDate[i].description,
      //                 itemsSortByDate[i].publishedAt,
      //                 itemsSortByDate[i].viewCount,
      //                 itemsSortByDate[i].likeCount,
      //                 itemsSortByDate[i].channelTitle,
      //                 itemsSortByDate[i].position);
      //}
  },//Ende addAllToSwiper()

  setVisibilityOfSinglePlaylistSwipers: async function(itemCount){
    document.getElementById("video-list-auswahl-position").classList.add("invisible");
    document.getElementById("video-list-auswahl-position-invers").classList.add("invisible");
    document.getElementById("video-list-auswahl-likes").classList.add("invisible");
    document.getElementById("video-list-auswahl-likes-invers").classList.add("invisible");
    document.getElementById("video-list-auswahl-views").classList.add("invisible");
    document.getElementById("video-list-auswahl-views-invers").classList.add("invisible");
    document.getElementById("video-list").classList.add("invisible");
    if(itemCount===undefined||itemCount!==1){
      if(this.alleVideosAnzeigen===true){
        document.getElementById("video-list").classList.toggle("invisible");
      }
      if(this.alleVideosAnzeigen===false){
        switch(this.videosSortBy){
          case "likeCount":
            if(this.sortDirection==="down"){ document.getElementById("video-list-auswahl-likes").classList.toggle("invisible"); }
            else{ document.getElementById("video-list-auswahl-likes-invers").classList.toggle("invisible"); }
            break;
          case "viewCount":
            if(this.sortDirection==="down"){ document.getElementById("video-list-auswahl-views").classList.toggle("invisible"); }
            else{ document.getElementById("video-list-auswahl-views-invers").classList.toggle("invisible"); }
            break;
          case "position":
            if(this.sortDirection==="down"){ document.getElementById("video-list-auswahl-position").classList.toggle("invisible"); }
            else{ document.getElementById("video-list-auswahl-position-invers").classList.toggle("invisible"); }
            break;
          default:
            document.getElementById("video-list-auswahl-position").classList.toggle("invisible");
            break;
        }
      }
    }
  },//Ende setVisibilityOfSinglePlaylistSwipers()

  initRelatedPlaylists: function(playlistId){
    var categoriesContainer = document.getElementById("single-playlist-related-playlists");
    while (categoriesContainer.firstChild) {
      categoriesContainer.removeChild(categoriesContainer.firstChild);
    }
    let isSeasonFound = false;
    let categories = getCategories();
    for(let i=0;i<categories.length;i++){
      let category=categories[i];
      if(category.categoryTheme!="lastUpdate"&&category.categoryTheme!="publishedAt"&&category.categoryTheme!="notCategorised"&&(category.categoryType==="related" || (category.categoryType==="seasons"&&isSeasonFound===false))){
        for(let i=0;i<category.categoryItems.length;i++){
          let item=category.categoryItems[i];
          if(item.id===playlistId){
            var template = document.getElementById("swipe-container-nav-template");
            var clone = document.importNode(template.content, true);
            //die Infos hinzufuegen
            clone.querySelector('h3').innerHTML=category.categoryName;
            // Neue Zeile (row) klonen und in die Tabelle einf�gen
            categoriesContainer.appendChild(clone);
            var categoryDiv = document.createElement('div');
            categoryDiv.setAttribute("class","category-swipe-container");
            categoriesContainer.appendChild(categoryDiv);
            category.categoryItems.forEach(function(item){
              addToCategoryTemplate(item,categoryDiv);
            });
            if(category.categoryType==="seasons"&&isSeasonFound===false){
              playlistId = category.categoryItems[0].id;
              isSeasonFound=true;
            }
            break;
          }
        }          
      }else{
        continue;
      }
    }
  }, //ENDE initRelatedPlaylists()
  addLastUpdatedPlaylists: function(playlistId){
    var category = getCategoryByName("Zuletzt aktualisiert");
    var template = document.getElementById("swipe-container-nav-template");
    var clone = document.importNode(template.content, true);
    //die Infos hinzufuegen
    clone.querySelector('h3').innerHTML=category.categoryName;
    // Neue Zeile (row) klonen und in die Tabelle einf�gen
    var categoriesContainer = document.getElementById("single-playlist-last-updated-playlists");
    categoriesContainer.appendChild(clone);
    var categoryDiv = document.createElement('div');
    categoryDiv.setAttribute("class","category-swipe-container");
    categoriesContainer.appendChild(categoryDiv);
    category.categoryItems.forEach(function(item){
      addToCategoryTemplate(item,categoryDiv);
    });
  } //ENDE addLastUpdatedPlaylists()
}


/****************************************************/
/*   ********************************************   */
/*   *           Suchanfragen                   *   */
/*   ********************************************   */
/****************************************************/

async function getPlaylistJSON(){
  var url = "http://localhost:11180/mediathek/playlists.json";
  return new Promise(function(resolve,reject){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET",url);
    xhr.onload = function(event){
      if (xhr.readyState === 4 && xhr.status === 200) { 
        console.log(xhr.status); 
        resolve(event.target.response);
      } else {
        console.error(xhr.statusText);
        reject("httprequeststatus nicht 200");
      }
    };
    xhr.onerror = function(event){
      console.error(xhr.statusText);
      reject("httprequest konnte nicht gesendet werden");
    }
    xhr.send();
  });
}


async function sucheAlleFormate(channelId,part,pageToken){
  if(pageToken!=undefined){
    var gUrl = "https://www.googleapis.com/youtube/v3/playlists?channelId=" + channelId + "&key=" + apiKey + "&part="+part+"&maxResults=50&pageToken="+pageToken;
  } else{
    var gUrl = "https://www.googleapis.com/youtube/v3/playlists?channelId=" + channelId + "&key=" + apiKey + "&part="+part+"&maxResults=50";
  }
  return new Promise(function(resolve,reject){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET",gUrl);
    xhr.onload = function(event){
      if (xhr.readyState === 4 && xhr.status === 200) { 
        console.log(xhr.status); 
        resolve(event);
      } else {
        console.error(xhr.statusText);
        reject("httprequeststatus nicht 200");
      }
    };
    xhr.onerror = function(event){
      console.error(xhr.statusText);
      reject("httprequest konnte nicht gesendet werden");
    }
    xhr.send();
  });
}

async function suchanfragePlaylistItems(playlistId,part,pageToken){
  if(pageToken!=undefined){
    var gUrl = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=" + playlistId + "&key=" + apiKey + "&part="+part+"&maxResults=50&pageToken="+pageToken;
  } else{
    var gUrl = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=" + playlistId + "&key=" + apiKey + "&part="+part+"&maxResults=50";
  }
  console.log(gUrl);
  return new Promise(function(resolve,reject){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET",gUrl,true);
    xhr.onload = function(event){
      if (xhr.readyState === 4 && xhr.status === 200) {  
        resolve(event);
      } else {
        console.error(xhr.statusText);
        reject("httprequeststatus nicht 200");
      }
    };
    xhr.onerror = function(event){
      console.error(xhr.statusText);
      reject("httprequest konnte nicht gesendet werden");
    }
    xhr.send();
  });
}
async function suchanfrageVideos(videoId,part,pageToken){
  if(pageToken!=undefined){
    var gUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + videoId + "&key=" + apiKey + "&part="+part+"&maxResults=50&pageToken="+pageToken;
  } else{
    var gUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + videoId + "&key=" + apiKey + "&part="+part+"&maxResults=50";
  }
  console.log(gUrl);
  return new Promise(function(resolve,reject){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET",gUrl,true);
    xhr.onload = function(event){
      if (xhr.readyState === 4 && xhr.status === 200) {  
        resolve(event);
      } else {
        console.error(xhr.statusText);
        reject("httprequeststatus nicht 200");
      }
    };
    xhr.onerror = function(event){
      console.error(xhr.statusText);
      reject("httprequest konnte nicht gesendet werden");
    }
    xhr.send();
  });
}

async function suchanfrageKomplett2(ids,part,pageToken){
  if(pageToken!=undefined){
    var gUrl = "https://www.googleapis.com/youtube/v3/playlists?id=" + ids + "&key=" + apiKey + "&part="+part+"&maxResults=50&pageToken="+pageToken;
  } else{
    var gUrl = "https://www.googleapis.com/youtube/v3/playlists?id=" + ids + "&key=" + apiKey + "&part="+part+"&maxResults=50";
  }
  //alert(gUrl);
  console.log(gUrl);
  return new Promise(function(resolve,reject){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open("GET",gUrl,true);
    xhr.onload = function(event){
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(event);
      } else {
        console.error(xhr.statusText);
        reject("httprequeststatus nicht 200");
      }
    };
    xhr.onerror = function(event){
      console.error(xhr.statusText);
      reject("httprequest konnte nicht gesendet werden");
    }
    xhr.send();
  });
}

/****************************************************/
/*   ********************************************   */
/*   *           DIE DATENBANK                  *   */
/*   ********************************************   */
/****************************************************/

const dbName = "Sendung";
const version = 1;

// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_pub_key;

/* alleFolgen=[folge_1 , ... , folge_n];
 *
 * folge1={          id: "string",
 *                title: "string",
 *             position: "int",
 *          description: "string",
 *           thumbnails: link,
 *         channelTitle: string,
 *            viewCount: "int",
 *            likeCount: "int",
 *         dislikeCount: "int",
 *          publishedAt: "date",
 *             duration: "time"      };
 */

// 1  *  *  * lade die favoriten-datenbank "db". *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
function connectToDB(dbName, version) {
  //console.log("connectToDB");
  return new Promise(function(resolve, reject){
    // 1.1  * Let us open our database *  *  *  *  *  *  *  *  *  *
    const dbOpenRequest = window.indexedDB.open(dbName, version);
    // 1.2  * version-change needed, while other tabs opened: request.onblocked = () => console.warn('pending till unblocked'); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onblocked = function(event) {
      //If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      alert("Please close all other tabs with this site open!");
      console.warn('pending till unblocked');
    };
    // 1.3  * Fehlerbehandlung: request.onerror = () => reject(request.error); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onerror = function(event) {
      // Handle errors.
      alert("Database error: " + event.target.errorCode);
      reject(dbOpenRequest.error);
    };
    // 1.4  * Ersteinrichtung der Datenbank/Updates: dbOpenRequest.onupgradeneeded = onupgradeneeded; *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onupgradeneeded = onupgradeneeded;
    // 1.5  * jetzt wird die Datenbank zurueckgegeben: dbOpenRequest.onsuccess = () => resolve(request.result); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onsuccess = function(event) {
      //console.log("Database initialised");
      //store the result of opening the database in the db variable. This is used a lot below
      //Better use "this" than "dbOpenRequest" to get the result to avoid problems with garbage collection.
      //statt db = dbOpenRequest.result; lieber
      resolve(this.result);
      //console.log("open db DONE");
    };
  });
};

//zu 1.4 *  * initialisierung der ersten Datenbankgestalt/Updates *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
var onupgradeneeded = function(event){
  console.log("openDb.onupgradeneeded");
  //1.4.1*  * All other databases have been closed. Set everything up. (erstmal nur das Datenbankger�st bauen) *  *  *  *  *  *  *  *  *  *
  var db = event.target.result;
  //1.4.2*  * Create an objectStore to hold information about our favorites. Wir nutzen "fanId" als key path weil es eindeutig ist *  *  *  *  *  *  *  *  *  *
  var objectStore = db.createObjectStore("alleFolgen", { keyPath: "id" });
  //1.4.3*  * Create an index to search Favorites by title. We may have duplicates so we can't use a unique index. *  *  *  *  *  *  *  *  *  *
  objectStore.createIndex("title", "title", { unique: false });
  objectStore.createIndex("viewCount", "viewCount", { unique: false });
  objectStore.createIndex("likeCount", "likeCount", { unique: false });
  objectStore.createIndex("position", "position", { unique: true });
  objectStore.createIndex("publishedAt", "publishedAt", { unique: false });
  objectStore.createIndex("duration", "duration", { unique: false });

  //objectStore.createIndex("firstFiftyLikeCount",["likeCount","position"],{ unique: false });
  //objectStore.createIndex("firstFiftyViewCount",["viewCount","position"],{ unique: false });

  //1.4.4*  * reload, wenn mehrere tabs offen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
  // Make sure to add a handler to be notified if another page requests a version
  // change. We must close the database. This allows the other page to upgrade the database.
  // If you don't do this then the upgrade won't happen until the user closes the tab.
  db.onversionchange = function(event) {
    db.close();
    alert("A new version of this page is ready. Please reload!");
  };
  //1.4.5*  * Do stuff with the database. (fuege initialdaten hinzu) *  *  *  *  *  *  *  *  *  *
  //Use transaction oncomplete to make sure the objectStore creation is finished before adding data into it.
  //objectStore.transaction.oncomplete = function(event) {
  //  //Hier kann man noch fakeDaten hinzufuegen
  //};
};

// 2  *  *  * Anfragen an die datenbank funktionieren dann so: *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
// 2.1*  *  * hole Favoriten-Funktionen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function get(id){
  var db = await connectToDB(dbName,version);
  return new Promise(function(resolve,reject){
    db.transaction(["alleFolgen"],"readonly").objectStore("alleFolgen").get(id).onsuccess = function(event) {
      result=event.target.result;
      db.close();
      resolve(result);
    };
    db.transaction(["alleFolgen"],"readonly").objectStore("alleFolgen").get(id).onerror = function(event) {
      console.log("ERROR");
      db.close();
      reject("ERROR");
    };
  });
}

async function getByPosition(position){
  var db = await connectToDB(dbName,version);
  return new Promise(function(resolve,reject){
    var trans = db.transaction(["alleFolgen"],"readonly");
    trans.objectStore("alleFolgen").index("position").get(position).onsuccess = function(event) {
      result=event.target.result;
      db.close();
      resolve(result);
    };
    trans.onerror = function(event) {
      console.log("ERROR");
      db.close();
      reject("ERROR");
    };
  });
}

async function getSome(count,index,direction){
  if(direction===undefined){
    direction="next";
  }
  console.log("getAll "+index);
  var db = await connectToDB(dbName,version);
  if(index==="viewCount" || index==="likeCount"){
    console.log("getAll2 "+index);
    return new Promise(function(resolve, reject){
      var folgen = new Array();
      console.log("getAll3 "+index);
      db.transaction("alleFolgen").objectStore("alleFolgen").index(index).openCursor(null,direction).onsuccess = function(event) {
        var cursor = event.target.result;
        console.log("CURSORAAAAAAAAAAAAAAAAAAAAAAAAAA "+cursor);
        if (cursor && folgen.length < count) {
          folgen.push(cursor.value);
          cursor.continue();
        }else{
          console.log("Got all folgen: " + folgen);
          db.close();
          resolve(folgen);
        }
      };
    });
  }else{
    return new Promise(function(resolve, reject){
      var folgen = new Array();
      console.log("getAll3 "+index);
      db.transaction("alleFolgen").objectStore("alleFolgen").index("position").openCursor(null,direction).onsuccess = function(event) {
        var cursor = event.target.result;
        console.log("CURSOR "+cursor);
        if (cursor && folgen.length < count) {
          folgen.push(cursor.value);
          cursor.continue();
        }else{
          //console.log("Got all folgen: " + folgen);
          db.close();
          resolve(folgen);
        }
      };
    });
  }
}

async function getAll(index,direction) {
  if(direction===undefined){
    direction="next";
  }
  console.log("getAll "+index);
  var db = await connectToDB(dbName,version);
  if(index==="viewCount" || index==="likeCount" || index==="position" || index==="publishedAt" ){
    console.log("getAll2 "+index);
    return new Promise(function(resolve, reject){
      var folgen = new Array();
      console.log("getAll3 "+index);
      db.transaction("alleFolgen").objectStore("alleFolgen").index(index).openCursor(null,direction).onsuccess = function(event) {
        var cursor = event.target.result;
        console.log("CURSOR "+cursor);
        if (cursor) {
          folgen.push(cursor.value);
          cursor.continue();
        }else{
          //console.log("Got all folgen: " + folgen);
          db.close();
          resolve(folgen);
        }
      };
    });
  }else{
    return new Promise(function(resolve, reject){
      var folgen = new Array();
      console.log("getAll3 "+index);
      db.transaction("alleFolgen").objectStore("alleFolgen").openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        console.log("CURSOR "+cursor);
        if (cursor) {
          folgen.push(cursor.value);
          cursor.continue();
        }else{
          //console.log("Got all folgen: " + folgen);
          db.close();
          resolve(folgen);
        }
      };
    });
  }
}

// 2.3*  *  * remove from favoriten - function *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function remove(id){
  var db = await connectToDB(dbName,version);
  db.transaction(["alleFolgen"], "readwrite").objectStore("alleFolgen").delete(id).onsuccess = function(event) {
    //It's gone!
    db.close();
  };
}

async function clearData() {
  var db = await connectToDB(dbName,version);
  // open a read/write db transaction, ready for clearing the data
  var transaction = db.transaction(["alleFolgen"], "readwrite");
  // create an object store on the transaction
  var objectStore = transaction.objectStore("alleFolgen");
  // Make a request to clear all the data out of the object store
  var objectStoreRequest = objectStore.clear();
  objectStoreRequest.onsuccess = function(event) {
    // report the success of our request
    //note.innerHTML += '<li>Request successful.</li>';
  };
  transaction.oncomplete = function(event) {
    db.close();
  };
  transaction.onerror = function(event) {
    //console.log('Transaction not opened due to error: ' + transaction.error);
  };
};

// 2.4*  *  * adding functions *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function add(id,title,position,description,thumbnails,channelTitle,viewCount,likeCount,dislikeCount,publishedAt,duration){
  position = parseInt(position);
  viewCount = parseInt(viewCount);
  likeCount = parseInt(likeCount);
  dislikeCount = parseInt(dislikeCount);
  var item = {id: id,title: title,position: position,description: description,thumbnails: thumbnails,channelTitle: channelTitle,viewCount: viewCount,likeCount: likeCount,dislikeCount: dislikeCount, publishedAt: publishedAt, duration: duration };
  console.log(item);
  var db = await connectToDB(dbName,version);
  var trans = db.transaction(["alleFolgen"], "readwrite");
  var objStr = trans.objectStore("alleFolgen");
  return new Promise(function(resolve,reject){
    objStr.add(item).onsuccess = function(evt){
      console.log("id: "+item.id);
      db.close();
      resolve(evt);
    };
  });

  //return new Promise(function(resolve,reject){
  //  trans.onsuccess = function(event){
  //
  //  };
  //
}


/************************************************/
/*                  Start                       */
/************************************************/

var apiKey='AIzaSyA_0poQnq8bwrrO8dXPE41K0nhjo9iGn0c';

document.addEventListener('DOMContentLoaded', initTinder);



//************************************************//
//*      DAS MEDIATHEK-OBJEKT der Favoriten      *//
//************************************************//

//Wir wollen unser Mediathek-Objekt bauen.
//
//var favoriten=[fav1, ... ,favn];
//var fav1={ favId: "Sting", //kann als key genutzt werden
//           favEtag: "string", //der etag eines Playlist-Such-items aendert sich nicht so lange sich an der Playlist nichts aendert
//           favTitle: "string",        // title und description hole ich von der aller ersten Playlist-suche, in der hoffnung, dass sich danach nichts mehr aendert
//           favDescription: "string",  // 
//           favChannelId: "string", //damit wei� ich mit welcher channelId ich die playlist-suche machen muss
//           favChannelTitle: "string", //damit wei� ich mit welcher channelId ich die playlist-suche machen muss
//           favThumbnail: "url als string", //Das folgende mache ich lieber doch nicht: das thumbnail hole ich vom ersten PlaylistItem, aendert sich mit jedem neuen Video
//           favVideoCount: "int", //das hole ich vom totalResults-token der Playlistitem-suche
//           favLastWatchedVideoIndex: "int", 
//           favListOfVideos: "Objekt mit den ersten 50 eintr�gen", //weil ich eh nach den Thumbnails suchen muss, kann ich gleich auch nach den snippets der ersten 50 playlistItems suchen und dessen daten speichern 
//           favWatchDate: "Datum in Millisekunden mit Date.now() gemacht"
//         };

//***********************************//
//*         DIE DATENBANK           *//
//***********************************//

//da die youtube data api-Requests und die indexeddb-Requests simultan auftreten,
//muss ich mich entscheiden, ob ich den indexeddb.open-request nur einmalig am anfang aufrufe, oder mit jedem Veraenderungs-request nochmal neu.
//Hier entscheide ich mich f�r ein neues oeffnen der datenbank mit jedem Bearbeitungswunsch, das ist nicht wesentlich langsamer und verhindert globale Variablen bei asynchronen Vorgaengen, und somit Fehlerquellen reduziert

const dbName2 = "mediathek";
const version2 = 1;

// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_pub_key;

// 1  *  *  * lade die favoriten-datenbank "db". *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
function connectToFavoriteDB(dbName, version) {
  //console.log("connectToDB");
  return new Promise(function(resolve, reject){
    // 1.1  * Let us open our database *  *  *  *  *  *  *  *  *  *
    const dbOpenRequest = window.indexedDB.open(dbName, version);
    // 1.2  * version-change needed, while other tabs opened: request.onblocked = () => console.warn('pending till unblocked'); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onblocked = function(event) {
      //If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      alert("Please close all other tabs with this site open!");
      console.warn('pending till unblocked');
    };
    // 1.3  * Fehlerbehandlung: request.onerror = () => reject(request.error); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onerror = function(event) {
      // Handle errors.
      alert("Database error: " + event.target.errorCode);
      reject(dbOpenRequest.error);
    };
    // 1.4  * Ersteinrichtung der Datenbank/Updates: dbOpenRequest.onupgradeneeded = onupgradeneeded; *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onupgradeneeded = favoriteOnupgradeneeded;
    // 1.5  * jetzt wird die Datenbank zurueckgegeben: dbOpenRequest.onsuccess = () => resolve(request.result); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onsuccess = function(event) {
      //console.log("Database initialised");
      //store the result of opening the database in the db variable. This is used a lot below
      //Better use "this" than "dbOpenRequest" to get the result to avoid problems with garbage collection.
      //statt db = dbOpenRequest.result; lieber
      resolve(this.result);
      //console.log("open db DONE");
    };
  });
};

//zu 1.4 *  * initialisierung der ersten Datenbankgestalt/Updates *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
var favoriteOnupgradeneeded = function(event){
  console.log("openDb.onupgradeneeded");
  //1.4.1*  * All other databases have been closed. Set everything up. (erstmal nur das Datenbankger�st bauen) *  *  *  *  *  *  *  *  *  *
  var db = event.target.result;
  //1.4.2*  * Create an objectStore to hold information about our favorites. Wir nutzen "fanId" als key path weil es eindeutig ist *  *  *  *  *  *  *  *  *  *
  var objectStore = db.createObjectStore("favoriten", { keyPath: "favId" });
  //1.4.3*  * Create an index to search Favorites by title. We may have duplicates so we can't use a unique index. *  *  *  *  *  *  *  *  *  *
  objectStore.createIndex("favTitle", "favTitle", { unique: false });
  objectStore.createIndex("favChannelId", "favChannelId", { unique: false });
  //objectStore.createIndex("favThumbnail", "favThumbnail", { unique: false });
  //objectStore.createIndex("favDescription", "favDescription", { unique: false });
  objectStore.createIndex("favVideoCount", "favVideoCount", { unique: false });
  //objectStore.createIndex("favLastWatchedVideoIndex", "favLastWatchedVideoIndex", { unique: false });
  //objectStore.createIndex("favListOfVideos", "favListOfVideos", { unique: false });
  //Create an index to search favorites by etag. a unique index.
  objectStore.createIndex("favEtag", "favEtag", { unique: true });
  objectStore.createIndex("favWatchDate", "favWatchDate", { unique: false });
  //1.4.4*  * reload, wenn mehrere tabs offen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
  // Make sure to add a handler to be notified if another page requests a version
  // change. We must close the database. This allows the other page to upgrade the database.
  // If you don't do this then the upgrade won't happen until the user closes the tab.
  db.onversionchange = function(event) {
    db.close();
    alert("A new version of this page is ready. Please reload!");
  };
  //1.4.5*  * Do stuff with the database. (fuege initialdaten hinzu) *  *  *  *  *  *  *  *  *  *
  //Use transaction oncomplete to make sure the objectStore creation is finished before adding data into it.
  objectStore.transaction.oncomplete = function(event) {
    //Store values in the newly created objectStore.
    var favoritenObjectStore = db.transaction("favoriten", "readwrite").objectStore("favoriten");
    //erstmalige initialisierung von fake-Favoriten falls noch keine Favoriten hinzugefuegt wurden
    var fakeDate = Date.now();
    console.log(fakeDate);
    var fakeFavoriten=[{favId: "PLsksxTH4pR3KoBcmcu8VcmYe9T5EHodgT", favWatchDate: fakeDate}, //Mayfeld und Bloomkamp
                       {favId: "PLztfM9GoCIGrhVwCfF6jsCxCteShsSjXw", favWatchDate: fakeDate}, //GameTwo
                       {favId: "PLsksxTH4pR3Jf9t1E21bLbFAxeBdXMKHX", favWatchDate: fakeDate}, //Quelle Internet
                       {favId: "PLsksxTH4pR3KGyhJid1oXtVsQcfgmxLoi", favWatchDate: fakeDate}, //Morriton Manor 
                       {favId: "PLsksxTH4pR3LhnoisL3wBIbmkxNqe6Eir", favWatchDate: fakeDate}, //Nerd Quiz
                       {favId: "PLsksxTH4pR3IPAMtiymcNFlhCcKFnxAd6", favWatchDate: fakeDate}, //Kino plus
                       {favId: "PLsksxTH4pR3IX9CL91UVp-6S9mFBmnlgF", favWatchDate: fakeDate}, //Royal Beef
                       {favId: "PLsksxTH4pR3Ilo0vc3S5owjkmUV6XtH6T", favWatchDate: fakeDate}, //Spiele mit Bart
                       {favId: "PLfU2RMxoOiSBMDn2OSYDT_t9oZQ4i0IfD", favWatchDate: fakeDate}];//Classix Pokemon
    for (var i in fakeFavoriten) {
      console.log("fakeFavoriten hinzufuegen");
      favoritenObjectStore.add(fakeFavoriten[i]);
      //request.onsuccess = function(event) {
      //  //Bem: event.target.result == fakeFavoriten[i].favId;
      //};
    }
  };
  //objectStore2.transaction.oncomplete = function(event) {
  //  //Store values in the newly created objectStore.
  //  var alleFormateObjectStore = db.transaction("alleFormate", "readwrite").objectStore("alleFormate");
  //  //erstmalige initialisierung von fake-Favoriten falls noch keine Favoriten hinzugefuegt wurden
  //  var fakeFormate=[{id: "PLsksxTH4pR3KoBcmcu8VcmYe9T5EHodgT"}, //Mayfeld und Bloomkamp
  //                   {id: "PLztfM9GoCIGrhVwCfF6jsCxCteShsSjXw"}, //GameTwo
  //                   {id: "PLsksxTH4pR3Jf9t1E21bLbFAxeBdXMKHX"}, //Quelle Internet
  //                   {id: "PLsksxTH4pR3KGyhJid1oXtVsQcfgmxLoi"}, //Morriton Manor 
  //                   {id: "PLsksxTH4pR3LhnoisL3wBIbmkxNqe6Eir"}, //Nerd Quiz
  //                   {id: "PLsksxTH4pR3IPAMtiymcNFlhCcKFnxAd6"}, //Kino plus
  //                   {id: "PLsksxTH4pR3IX9CL91UVp-6S9mFBmnlgF"}, //Royal Beef
  //                   {id: "PLsksxTH4pR3Ilo0vc3S5owjkmUV6XtH6T"}, //Spiele mit Bart
  //                   {id: "PLfU2RMxoOiSBMDn2OSYDT_t9oZQ4i0IfD"}];//Classix Pokemon
  //  for (var i in fakeFormate) {
  //    alleFormateObjectStore.add(fakeFormate[i]);
  //    //request.onsuccess = function(event) {
  //    //  //Bem: event.target.result == fakeFavoriten[i].favId;
  //    //};
  //  }
  //};
};

// 2  *  *  * Anfragen an die datenbank funktionieren dann so: *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
//connectToDB(dbName,version).then(function(db){
//  db.transaction .........
//  und am Ende nicht db.close(); vergessen
//});
// 2.0.1 *  * mit try/catch/finally sieht das so in etwa aus: *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
//let db; //let=nicht globales var
//try {
//  connectToDB(dbName,version).then(function(db){
//    db.transaction.....;
//  });
//} finally {
//  if(db)
//    db.close();
//}


// 2.1*  *  * hole Favoriten-Funktionen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 

async function getFavorite(id){
  var db = await connectToFavoriteDB(dbName2,version2);
  return new Promise(function(resolve,reject){
    db.transaction(["favoriten"],"readonly").objectStore("favoriten").get(id).onsuccess = function(event) {
      result=event.target.result;
      db.close();
      resolve(result);
    };
    db.transaction(["favoriten"],"readonly").objectStore("favoriten").get(id).onerror = function(event) {
      console.log("ERROR");
      db.close();
      reject("ERROR");
    };
  });
}

async function holeFavIds() {
  var db = await connectToFavoriteDB(dbName2,version2);
  return new Promise(function(resolve, reject){
    var favIds = new Array();
    db.transaction("favoriten").objectStore("favoriten").index("favWatchDate").openKeyCursor(null, "prev").onsuccess = function(event) {
      var cursor = event.target.result;      
      console.log(cursor);
      if (cursor) {
        favIds.push(cursor.primaryKey);
        cursor.continue();
      }else{
        //console.log("Got all favIds: " + favIds);
        db.close();
        resolve(favIds);
      }
    };
  });
}


// 2.2*  *  * aktualisiere (put) Favoriten-Funktionen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 

async function putFavorite(newData){
  var db = await connectToFavoriteDB(dbName2,version2);
  var objectStore = db.transaction(["favoriten"],"readwrite").objectStore("favoriten");
  objectStore.get(newData.id).onsuccess = function(event) {
    var data = event.target.result;
    data.favEtag = newData.etag;
    data.favTitle = newData.snippet.title;
    data.favDescription = newData.snippet.description;
    data.favChannelId = newData.snippet.channelId;
    data.favChannelTitle = newData.snippet.channelTitle;
    data.favThumbnail = newData.snippet.thumbnails.medium.url;
    data.favVideoCount = newData.contentDetails.itemCount;
    //Put this updated object back into the database.
    objectStore.put(data).onsuccess = function(event) {
      //console.log("Success - the data is updated!");
      db.close();
    };
 };
}

async function putVideoCount(id){
  var db = await connectToFavoriteDB(dbName2,version2);
  var objectStore = db.transaction(["favoriten"],"readwrite").objectStore("favoriten");
  objectStore.get(id).onsuccess = function(event) {
    var data = event.target.result;    
    data.favLastWatchedVideoIndex = data.favVideoCount;
    //Put this updated object back into the database.
    objectStore.put(data).onsuccess = function(event) {
      //Success - the data is updated!
      db.close();
    };
 };
}

// 2.3*  *  * remove from favoriten - function *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function removeFavorite(id){
  var db = await connectToFavoriteDB(dbName2,version2);
  db.transaction(["favoriten"], "readwrite").objectStore("favoriten").delete(id).onsuccess = function(event) {
    //It's gone!
    db.close();
  };
}


// 2.4*  *  * adding functions *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function addFavorite(id){
  var favDate=Date.now();
  var item = {favId: id, favWatchDate: favDate};
  var db = await connectToFavoriteDB(dbName2,version2);
  db.transaction(["favoriten"], "readwrite").objectStore("favoriten").add(item).onsuccess = function(event) {
    //event.target.result == item.favId;
    //console.log("add: " + item.favId);
    db.close();
  };
}

//function addFav(favId,favEtag,favTitle,favDescription,favChannelId,favThumbnail,favVideoCount,favLastWatchedVideoIndex,favListOfVideos){
function addFav(arrayOfObjOfFavData){
  //Here an array of new objects is given. Otherwise create a new object to insert into the IDB
  //var newItem = [ { favId: favId,favEtag: favEtag,favTitle: favTitle,favDescription: favDescription,
  //                  favChannelId: favChannelId,favThumbnail: favThumbnail, favVideoCount: favVideoCount,
  //                  favLastWatchedVideoIndex: favLastWatchedVideoIndex, favListOfVideos;favListOfVideos } ];

  //open a read/write db transaction, ready to add data
  var transaction = db.transaction(["favoriten"], "readwrite");
  //Do something when all the data is added to the database.
  transaction.oncomplete = function(event) {
    //report on the success of opening the transaction
    //console.log("Transaction completed: database modification finished.");
    alert("All done!");
  };
  transaction.onerror = function(event) {
    // Don't forget to handle errors!
  };
  //create an object store on the transaction
  var objectStore = transaction.objectStore("favoriten");
  //add our objects of new items to the object store
  for (var i in arrayOfObjOfFavData) {
    var objectStoreRequest = objectStore.add(arrayOfObjOfFavData[i]);
    objectStoreRequest.onsuccess = function(event) {
      //Bem: event.target.result == arrayOfObjOfFavData[i].favId;
      //report the success of the request (this does not mean the item has been stored successfully in the DB - for that you need transaction.onsuccess)
      //console.log("Request successful.");
    };
  }
}

//************************************************//
//*  DAS MEDIATHEK-OBJEKT der Tindered-Playlists *//
//************************************************//

//Tinder-Datenbank: TinderedPlaylists
//var tinderedPlaylists=[tinderedPlaylist1,...,tinderedPlaylistn];
//var tinderedPlaylist1={ playlistId: "String";
//                        tinderStatus: like, dislike oder aufgeschoben}  };


const dbName3 = "Tinder";
const version3 = 1;

// 1  *  *  * lade die Tinder-datenbank "db". *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
function connectToTinderDB(dbName, version) {
  //alert("connectToDB");
  return new Promise(function(resolve, reject){
    // 1.1  * Let us open our database *  *  *  *  *  *  *  *  *  *
    const dbOpenRequest = window.indexedDB.open(dbName, version);
    // 1.2  * version-change needed, while other tabs opened: request.onblocked = () => console.warn('pending till unblocked'); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onblocked = function(event) {
      //If some other tab is loaded with the database, then it needs to be closed before we can proceed.
      alert("Please close all other tabs with this site open!");
      console.warn('pending till unblocked');
    };
    // 1.3  * Fehlerbehandlung: request.onerror = () => reject(request.error); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onerror = function(event) {
      // Handle errors.
      alert("Database error: " + event.target.errorCode);
      reject(dbOpenRequest.error);
    };
    // 1.4  * Ersteinrichtung der Datenbank/Updates: dbOpenRequest.onupgradeneeded = onupgradeneeded; *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onupgradeneeded = tinderOnupgradeneeded;
    // 1.5  * jetzt wird die Datenbank zurueckgegeben: dbOpenRequest.onsuccess = () => resolve(request.result); *  *  *  *  *  *  *  *  *  *
    dbOpenRequest.onsuccess = function(event) {
      //console.log("Database initialised");
      //store the result of opening the database in the db variable. This is used a lot below
      //Better use "this" than "dbOpenRequest" to get the result to avoid problems with garbage collection.
      //statt db = dbOpenRequest.result; lieber
      //alert("open db DONE");
      resolve(this.result);
      //console.log("open db DONE");
    };
  });
};

//zu 1.4 *  * initialisierung der ersten Datenbankgestalt/Updates *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
var tinderOnupgradeneeded = function(event){
  console.log("openDb.onupgradeneeded");
  //1.4.1*  * All other databases have been closed. Set everything up. (erstmal nur das Datenbankger�st bauen) *  *  *  *  *  *  *  *  *  *
  var db = event.target.result;
  //1.4.2*  * Create an objectStore to hold information about our favorites. Wir nutzen "fanId" als key path weil es eindeutig ist *  *  *  *  *  *  *  *  *  *
  var objectStore = db.createObjectStore("tinderedPlaylists", { keyPath: "playlistId" });
  //1.4.3*  * Create an index to search Favorites by title. We may have duplicates so we can't use a unique index. *  *  *  *  *  *  *  *  *  *
  objectStore.createIndex("tinderStatus", "tinderStatus", { unique: false });
  //1.4.4*  * reload, wenn mehrere tabs offen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
  // Make sure to add a handler to be notified if another page requests a version
  // change. We must close the database. This allows the other page to upgrade the database.
  // If you don't do this then the upgrade won't happen until the user closes the tab.
  db.onversionchange = function(event) {
    db.close();
    alert("A new version of this page is ready. Please reload!");
  };
  //1.4.5*  * Do stuff with the database. (fuege initialdaten hinzu) *  *  *  *  *  *  *  *  *  *
  //objectStore.transaction.oncomplete = function(event) {
    //var tinderObjectStore = db.transaction("tinderedPlaylists", "readwrite").objectStore("tinderedPlaylists");
  //};
};

// 2  *  *  * Anfragen an die datenbank funktionieren dann so: *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
//connectToDB(dbName,version).then(function(db){
//  db.transaction .........
//  und am Ende nicht db.close(); vergessen
//});
// 2.0.1 *  * mit try/catch/finally sieht das so in etwa aus: *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
//let db; //let=nicht globales var
//try {
//  connectToDB(dbName,version).then(function(db){
//    db.transaction.....;
//  });
//} finally {
//  if(db)
//    db.close();
//}


// 2.1*  *  * hole Favoriten-Funktionen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function getTinderedPlaylistsById() {
  var db = await connectToTinderDB(dbName3,version3);
  console.log("getTindereedPlaylistsById");
  return new Promise(function(resolve, reject){
    var tinderedIds = new Array();
    console.log("getTindereedPlaylistsById2");
    db.transaction("tinderedPlaylists").objectStore("tinderedPlaylists").openCursor().onsuccess = function(event) {
    //db.transaction("tinderedPlaylists").objectStore("tinderedPlaylists").openCursor(null, "prev").onsuccess = function(event) {
    //db.transaction("tinderedPlaylists").objectStore("tinderedPlaylists").index("playlistId").openKeyCursor(null, "prev").onsuccess = function(event) {
      var cursor = event.target.result;
      //alert(cursor.key);
      //console.log(cursor);
      if (cursor) {
        tinderedIds.push(cursor.key);
        cursor.continue();
      }else{
        //console.log("Got all favIds: " + favIds);
        db.close();
        //alert("Hallo: "+tinderedIds[0]);
        resolve(tinderedIds);
      }
    };
  });
}

// 2.2*  *  * aktualisiere (put) Favoriten-Funktionen *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
// 2.3*  *  * remove from favoriten - function *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
// 2.4*  *  * adding functions *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *

async function addTinderedPlaylist(id,status){
  //alert("in add");
  var item = {playlistId: id, tinderStatus: status};
  var db = await connectToTinderDB(dbName3,version3);
  db.transaction(["tinderedPlaylists"], "readwrite").objectStore("tinderedPlaylists").add(item).onsuccess = function(event) {
    //event.target.result == item.favId;
    //alert("add: " + item.playlistId);
    db.close();
  };
}

/************************************************/
/*                  Ende                        */
/************************************************/

}) ();
