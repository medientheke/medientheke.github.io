<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">  
  <title>Kategorien und Tinderliste erstellen</title>
</head>
<body>
  <?php
    ini_set('max_execution_time', 500); //300 seconds = 5 minutes

    function sucheAlleCommunityFormate($id,$part,$pageToken){
      $apiKey="AIzaSyA_0poQnq8bwrrO8dXPE41K0nhjo9iGn0c";
      if($pageToken!=null){
        $gUrl = "https://www.googleapis.com/youtube/v3/playlists?id=".$id."&key=".$apiKey."&part=".$part."&maxResults=50&pageToken=".$pageToken;
      }else{
        $gUrl = "https://www.googleapis.com/youtube/v3/playlists?id=".$id."&key=".$apiKey."&part=".$part."&maxResults=50";
      }
      //echo(file_get_contents($gUrl));
      $data = json_decode(file_get_contents($gUrl));
      return $data;
    }
    function sucheAlleFormate($channelId,$part,$pageToken){
      $apiKey="AIzaSyA_0poQnq8bwrrO8dXPE41K0nhjo9iGn0c";
      if($pageToken!=null){
        $gUrl = "https://www.googleapis.com/youtube/v3/playlists?channelId=".$channelId."&key=".$apiKey."&part=".$part."&maxResults=50&pageToken=".$pageToken;
      }else{
        $gUrl = "https://www.googleapis.com/youtube/v3/playlists?channelId=".$channelId."&key=".$apiKey."&part=".$part."&maxResults=50";
      }
      //echo(file_get_contents($gUrl));
      $data = json_decode(file_get_contents($gUrl));
      return $data;
    }
    function suchanfragePlaylistItems($playlistId,$part,$pageToken){
      $apiKey="AIzaSyA_0poQnq8bwrrO8dXPE41K0nhjo9iGn0c";
      if(pageToken!=null){
        $gUrl = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=".$playlistId."&key=".$apiKey."&part=".$part."&maxResults=50&pageToken=".$pageToken;
      }else{
        $gUrl = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=".$playlistId."&key=".$apiKey."&part=".$part."&maxResults=50";
      }
      //echo(file_get_contents($gUrl));
      $data = json_decode(file_get_contents($gUrl));
      return $data;
    }
    function getCompleteDataOfPlaylists($items){
      $playlists=[];
      foreach($items as $item){
        $lastUpdate = "2000-00";
        $pageToken = null;
        do{
          $response = suchanfragePlaylistItems($item->id,"id,snippet,contentDetails",$pageToken);
          $pageToken = $response->nextPageToken;
          $playlistItems = $response->items;
          //echo(json_encode($playlistItems));
          foreach($playlistItems as $playlistItem){
            if($lastUpdate<$playlistItem->snippet->publishedAt){
              $lastUpdate = $playlistItem->snippet->publishedAt;
            }
          }
        }while($pageToken);
        $tinderPosition = rand();
        //packe $lastUpdate und alle anderen Infos in $playlists
        $playlist = (object) [ 'id' => $item->id, 
                               'title' => $item->snippet->title,
                               'description' => $item->snippet->description,
                               'channelId' => $item->snippet->channelId,
                               'channelTitle' => $item->snippet->channelTitle,
                               'thumbnails' => $item->snippet->thumbnails,
                               'itemCount' => $item->contentDetails->itemCount,
                               'publishedAt' => $item->snippet->publishedAt,
                               'lastUpdate' => $lastUpdate,
                               'tinderPosition' => $tinderPosition 
                             ];
        array_push($playlists,$playlist);
      }
      echo("items: ".json_encode($playlists)."<br/>");
      echo("FERTIG geladen <br/>");
      return $playlists;
    }    

    /****************************************************/
    /*          Hier gehts los                          */
    /****************************************************/    

    echo("halli hallo <br/>");
    $items=[];
    $playlists=[];    
    $channelIds=["UCFBapHA35loZ3KZwT_z3BsQ","UCtSP1OA6jO4quIGLae7Fb4g","UCQvTDmHza8erxZqDkjQ4bQQ"];
    foreach($channelIds as $channelId){
      $pageToken = null;
      do{
        echo("suche in $channelId <br/>");
        $response = sucheAlleFormate($channelId,"id,snippet,contentDetails",$pageToken);
        $pageToken = $response->nextPageToken;
        $items = array_merge($items,$response->items);
      }while($pageToken);
    }
    //echo("items: ".json_encode($responses));
    $playlists = getCompleteDataOfPlaylists($items);

    $playlistsFile = fopen("playlists.js", "w") or die("Unable to open file!");
    $functionTxt = "function getPlaylists(sortBy,direction){if(direction!==1&&direction!==-1){direction=1;}if(sortBy!==\"tinderPosition\"&&sortBy!==\"title\"&&sortBy!==\"channelTitle\"&&sortBy!==\"itemCount\"&&sortBy!==\"publishedAt\"&&sortBy!==\"lastUpdate\"){sortBy=\"lastUpdate\";}return playlists.sort(function(a,b){return(a[sortBy]>b[sortBy])?direction:((b[sortBy]>a[sortBy])?-direction:0);});}";
    $playlistsTxt="var playlists = ".json_encode($playlists).";";
    fwrite($playlistsFile,$functionTxt.$playlistsTxt);
    fclose($playlistsFile);
    echo("FERTIG playlists.js geschrieben <br/>");

    //wir fuellen die Kategorien "zuletzt aktualisiert" und "neueste Formate"
    $categoriesComplete=[];
    usort($playlists, function($a, $b){
      return -strcmp($a->lastUpdate, $b->lastUpdate);
    });
    $newItemsComplete=[];
    for($i=0;$i<11&&$i<count($playlists);$i++){
      array_push($newItemsComplete,$playlists[$i]);
      echo("PLAYLIST mit ID: ".$playlists[$i]->id." wurde kuerzlich aktualisiert <br/>");
    }
    if(count($newItemsComplete)>0){
      $newComplete = (object) [ 'categoryTheme' => "lastUpdate",'categoryType' => "related",'categoryName' => "Zuletzt aktualisiert", 'categoryItems' => $newItemsComplete];
      array_push($categoriesComplete,$newComplete);
    }
    usort($playlists, function($a, $b){
      return -strcmp($a->publishedAt, $b->publishedAt);
    });
    $newItemsComplete=[];
    for($i=0;$i<11&&$i<count($playlists);$i++){
      array_push($newItemsComplete,$playlists[$i]);
      echo("PLAYLIST mit ID: ".$playlists[$i]->id." wurde kuerzlich erstellt <br/>");
    }
    if(count($newItemsComplete)>0){
      $newComplete = (object) [  'categoryTheme' => "publishedAt",'categoryType' => "related",'categoryName' => "Neueste Formate und Shows", 'categoryItems' => $newItemsComplete];
      array_push($categoriesComplete,$newComplete);
    }

    // liest den Inhalt einer Datei in einen String
    $categoriesFile = fopen("categories.json", "r");
    $categories = fread($categoriesFile, filesize("categories.json"));
    echo($categories);
    $categories = json_decode($categories);
    fclose($categoriesFile);

    //jetzt wird auch nach Community-Uploads etc gesucht (diese sind in der Datei categories.json unter dem categoryType="community" zusammengefasst)
    $items=[];
    $communityPlaylistIds=[];
    foreach($categories as $category){
      if($category->categoryTheme=="community"){
        $communityPlaylistIds = array_merge($communityPlaylistIds,$category->categoryIds);    
      }
    }
    $j=0;
    while($j<count($communityPlaylistIds)){
      //baue String:
      $communityPlaylistIdsString="";
      $l = min(49,count($communityPlaylistIds)-1-$j);
      for($i=0;$i<$l;$i++){
        $communityPlaylistIdsString=$communityPlaylistIdsString.$communityPlaylistIds[$i].",";
      }
      $communityPlaylistIdsString=$communityPlaylistIdsString.$communityPlaylistIds[$l];
      echo($communityPlaylistIdsString);
      echo("suche nach Community-Playlists und -Uploads <br/>");
      $response = sucheAlleCommunityFormate($communityPlaylistIdsString,"id,snippet,contentDetails",$pageToken);
        $pageToken = $response->nextPageToken;
        $items = array_merge($items,$response->items);
      $j=$j+50;
    }

    //echo("items: ".json_encode($responses));
    $communityPlaylists = getCompleteDataOfPlaylists($items);

    $playlists = array_merge($playlists,$communityPlaylists);
    
    // neue Playlists erkennen und in die Kategorie "nicht Kategorisiert" stecken
    $newItemsComplete=[];
    echo("STARTE mit dem Vervollstaendigen der Kategorien <br/>");
    foreach($playlists as $playlist){
      //echo("PLAYLIST: ".$playlist->id.", ".$playlist->title." <br/>");
      $playlistIsNew=true;
      foreach($categories as $category){
        //echo("CATEGORYNAME: ".$category->categoryName." <br/>");
        foreach($category->categoryIds as $categoryId){
          //echo($categoryId." <br/>");
          if($playlist->id==$categoryId){
            $playlistIsNew=false;
            //echo("break <br/>");
            break 2;
          }
        }
      }
      if($playlistIsNew==true){
        array_push($newItemsComplete,$playlist);
        echo("PLAYLIST mit ID: ".$playlist->id." in keiner Kategorie vorhanden <br/>");
      }
    }
    if(count($newItemsComplete)>0){
      $newComplete = (object) [ 'categoryTheme' => "notCategorised",'categoryType' => "related",'categoryName' => "noch nicht kategorisiert", 'categoryItems' => $newItemsComplete];
      array_push($categoriesComplete,$newComplete);
    }
    // bestehende Kategorien mit infos fuellen
    foreach($categories as $category){
      echo("CATEGORYNAME: ".$category->categoryName." <br/>");
      $categoryItemsComplete=[];
      foreach($category->categoryIds as $categoryId){
        $isPlaylistFound=false;
        foreach($playlists as $playlist){
          if($playlist->id==$categoryId){
            array_push($categoryItemsComplete,$playlist);
            $isPlaylistFound=true;
            break;
          }
        }
        if($isPlaylistFound==false){
          echo("FEHLER: zu $categoryId keine Playlist gefunden <br/>");
        }
      }
      $categoryComplete = (object) [ 'categoryTheme' => $category->categoryTheme,'categoryName' => $category->categoryName,'categoryType' => $category->categoryType,'categoryItems' => $categoryItemsComplete];
      
      array_push($categoriesComplete,$categoryComplete);
    }
    
    $categoriesCompleteFile = fopen("categories.js", "w") or die("Unable to open file!");
    $functionTxt = "function getCategories(filteredBy){if(filteredBy===undefined){return categories;}else{let i=categories.length;let filteredCategories=[];for(let i=0;i<categories.length;i++){if(categories[i].categoryType===filteredBy){filteredCategories.push(categories[i]);}}return filteredCategories;}}
                    function getCategoryByName(name){for(let i=0;i<categories.length;i++){if(categories[i].categoryName===name){return categories[i];}}}";
    $categoriesCompleteTxt = "var categories = ".json_encode($categoriesComplete).";";
    fwrite($categoriesCompleteFile,$functionTxt.$categoriesCompleteTxt);
    fclose($categoriesCompleteFile);
    echo("FERTIG categories.js geschrieben <br/>");
  ?>
</body>
</html>
