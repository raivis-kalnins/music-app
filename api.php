<?php
declare(strict_types=1);require __DIR__.'/includes/bootstrap.php';$a=$_GET['action']??'';
if($a==='status'){$u=user();out(['ok'=>true,'authenticated'=>(bool)$u,'user'=>$u,'csrf'=>$u?csrf():null,'appName'=>cfg('app_name'),'aiConfigured'=>(bool)cfg('openai_api_key'),'aiModel'=>cfg('openai_model'),'aiSource'=>ai_source()]);}
if($a==='login'&&$_SERVER['REQUEST_METHOD']==='POST'){$d=input();$email=strtolower(clean($d['email']??'',200));$pw=(string)($d['password']??'');$found=null;foreach(jr('users.json',[]) as $u)if(strtolower((string)($u['email']??''))===$email&&!empty($u['passwordHash'])&&empty($u['disabled'])){$found=$u;break;}if(!$found||!password_verify($pw,$found['passwordHash'])){usleep(200000);out(['ok'=>false,'error'=>'Email or password is incorrect.'],401);}session_regenerate_id(true);$_SESSION['uid']=$found['id'];$_SESSION['csrf']=bin2hex(random_bytes(24));audit('login');out(['ok'=>true,'user'=>user(),'csrf'=>csrf()]);}
if($a==='media'){auth();$id=clean($_GET['id']??'',100);foreach(jr('media.json',[]) as $m)if(($m['id']??'')===$id){$p=MUSIC63_STORAGE.'/uploads/'.basename($m['stored']);if(!is_file($p))out(['ok'=>false,'error'=>'File not found.'],404);header('Content-Type: '.($m['mime']??'application/octet-stream'));header('Content-Length: '.filesize($p));header('Content-Disposition: inline; filename="'.rawurlencode($m['name']??'file').'"');readfile($p);exit;}out(['ok'=>false,'error'=>'File not found.'],404);}
$me=auth();if($_SERVER['REQUEST_METHOD']!=='GET')check_csrf();
switch($a){
case 'logout':audit('logout');$_SESSION=[];session_destroy();out(['ok'=>true]);
case 'songs':$s=jr('songs.json',[]);usort($s,fn($x,$y)=>strcmp((string)($y['updatedAt']??''),(string)($x['updatedAt']??'')));out(['ok'=>true,'songs'=>$s]);
case 'save_song':$d=input();$song=song_norm(is_array($d['song']??null)?$d['song']:[]);$rows=jr('songs.json',[]);$hit=false;foreach($rows as $i=>$r)if(($r['id']??'')===$song['id']){$song['createdAt']=$r['createdAt']??$song['createdAt'];$rows[$i]=$song;$hit=true;break;}if(!$hit)$rows[]=$song;jw('songs.json',$rows);audit('save_song',['songId'=>$song['id']]);out(['ok'=>true,'song'=>$song]);
case 'delete_song':$id=clean(input()['id']??'',100);jw('songs.json',array_values(array_filter(jr('songs.json',[]),fn($s)=>($s['id']??'')!==$id)));audit('delete_song',['songId'=>$id]);out(['ok'=>true]);
case 'settings':out(['ok'=>true,'settings'=>jr('settings.json',[])]);
case 'media_list':
  $rows=jr('media.json',[]); usort($rows,fn($x,$y)=>strcmp((string)($y['uploadedAt']??''),(string)($x['uploadedAt']??'')));
  $safe=array_map(fn($m)=>['id'=>$m['id']??'','name'=>$m['name']??'file','mime'=>$m['mime']??'application/octet-stream','size'=>(int)($m['size']??0),'uploadedAt'=>$m['uploadedAt']??'','user'=>$m['user']??'','url'=>'api.php?action=media&id='.rawurlencode((string)($m['id']??''))],$rows);
  out(['ok'=>true,'media'=>$safe]);
case 'delete_media':
  $id=clean(input()['id']??'',100); $rows=jr('media.json',[]); $kept=[]; $deleted=false;
  foreach($rows as $m){if(($m['id']??'')===$id){if(($me['role']??'')!=='admin'&&($m['user']??'')!==($me['email']??''))out(['ok'=>false,'error'=>'You can only remove your own uploaded files.'],403);$path=MUSIC63_STORAGE.'/uploads/'.basename((string)($m['stored']??''));if(is_file($path))@unlink($path);$deleted=true;continue;}$kept[]=$m;}
  if(!$deleted)out(['ok'=>false,'error'=>'File not found.'],404); jw('media.json',$kept); audit('delete_media',['mediaId'=>$id]); out(['ok'=>true]);
case 'save_source_bookmarks':
  $d=input(); $rows=is_array($d['bookmarks']??null)?array_slice($d['bookmarks'],0,100):[]; $cleanRows=[];
  foreach($rows as $r){if(!is_array($r))continue;$label=clean($r['label']??'',160);$url=clean($r['url']??'',2000);$category=clean($r['category']??'My links',80);if($label===''||!filter_var($url,FILTER_VALIDATE_URL))continue;$scheme=strtolower((string)parse_url($url,PHP_URL_SCHEME));if(!in_array($scheme,['https','http'],true))continue;$cleanRows[]=['label'=>$label,'url'=>$url,'category'=>$category?:'My links'];}
  $st=jr('settings.json',[]);$st['sourceBookmarks']=$cleanRows;jw('settings.json',$st);out(['ok'=>true,'settings'=>$st]);
case 'ai_settings':
  admin();
  out(['ok'=>true,'configured'=>(bool)cfg('openai_api_key'),'model'=>(string)cfg('openai_model'),'source'=>ai_source(),'maskedKey'=>ai_masked_key()]);
case 'translate_ui':
  $d=input(); $lang=clean($d['language']??'en',10); $names=['lv'=>'Latvian','de'=>'German','es'=>'Spanish','fr'=>'French','pl'=>'Polish','ru'=>'Russian','uk'=>'Ukrainian','lt'=>'Lithuanian','et'=>'Estonian','sv'=>'Swedish','no'=>'Norwegian','da'=>'Danish','fi'=>'Finnish','is'=>'Icelandic'];
  if(!isset($names[$lang]))out(['ok'=>true,'translations'=>[]]); $strings=is_array($d['strings']??null)?array_values(array_slice($d['strings'],0,120)):[]; $strings=array_map(fn($x)=>clean($x,240),$strings); $strings=array_values(array_filter($strings,fn($x)=>$x!=='')); if(!$strings)out(['ok'=>true,'translations'=>[]]);
  $cp=MUSIC63_STORAGE.'/private/ui-i18n.json';$cache=[];if(is_file($cp)){$tmp=json_decode((string)@file_get_contents($cp),true);if(is_array($tmp))$cache=$tmp;}if(!isset($cache[$lang])||!is_array($cache[$lang]))$cache[$lang]=[];
  $outMap=[];$missing=[];foreach($strings as $x){if(isset($cache[$lang][$x]))$outMap[$x]=$cache[$lang][$x];else $missing[]=$x;}
  if($missing){if(!cfg('openai_api_key'))out(['ok'=>false,'error'=>'AI connection is required only for untranslated help text. Core language labels still work without it.'],409);$schema=['type'=>'object','properties'=>['translations'=>['type'=>'array','items'=>['type'=>'string']]],'required'=>['translations'],'additionalProperties'=>false];$prompt="Translate these private music-app UI strings from English into {$names[$lang]}. Preserve Music 63, MIDI, MusicXML, WAV, PDF, BPM, instrument names, note names, arrows, emoji, keyboard shortcuts, URLs, and HTML-like symbols. Keep translations concise and natural for buttons/help text. Return one translation for each input string in exactly the same order. Strings:\n".json_encode($missing,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$body=['model'=>cfg('openai_model'),'input'=>[['role'=>'user','content'=>$prompt]],'text'=>['format'=>['type'=>'json_schema','name'=>'ui_translation','strict'=>true,'schema'=>$schema]]];$rr=openai_http($body,50);if(($rr['code']??0)>=200&&($rr['code']??0)<300){$resp=json_decode((string)$rr['raw'],true);$txt='';foreach(($resp['output']??[]) as $it)foreach(($it['content']??[]) as $cc)if(($cc['type']??'')==='output_text')$txt.=(string)($cc['text']??'');$obj=json_decode($txt,true);$trs=is_array($obj['translations']??null)?$obj['translations']:[];foreach($missing as $i=>$x){$tr=clean($trs[$i]??$x,400);$cache[$lang][$x]=$tr?:$x;$outMap[$x]=$cache[$lang][$x];}@mkdir(dirname($cp),0770,true);@file_put_contents($cp,json_encode($cache,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT),LOCK_EX);}else out(['ok'=>false,'error'=>openai_error_message($rr)],502);}
  out(['ok'=>true,'translations'=>$outMap]);
case 'save_ai_settings':
  admin(); $d=input(); $saved=ai_secret_read();
  $model=clean($d['model']??($saved['model']??cfg('openai_model')),100);
  if(!preg_match('/^gpt-[A-Za-z0-9._-]+$/',$model))out(['ok'=>false,'error'=>'Invalid OpenAI model name.'],422);
  if(!empty($d['clearKey']))unset($saved['apiKey']);
  if(array_key_exists('apiKey',$d)){
    $newKey=trim((string)$d['apiKey']);
    if($newKey!==''){
      if(strlen($newKey)<20||strlen($newKey)>300)out(['ok'=>false,'error'=>'The API key does not look valid.'],422);
      $saved['apiKey']=$newKey;
    }
  }
  $saved['model']=$model; $saved['updatedAt']=gmdate('c'); ai_secret_write($saved); audit('save_ai_settings',['model'=>$model,'source'=>ai_source()]);
  out(['ok'=>true,'configured'=>(bool)cfg('openai_api_key'),'model'=>(string)cfg('openai_model'),'source'=>ai_source(),'maskedKey'=>ai_masked_key()]);
case 'test_ai':
  admin(); if(!cfg('openai_api_key'))out(['ok'=>false,'error'=>'Add an OpenAI API key first.'],409);
  $body=['model'=>(string)cfg('openai_model'),'input'=>'Reply with exactly: Music 63 API connected.','max_output_tokens'=>30];
  $rr=openai_http($body,35); if(($rr['code']??0)<200||($rr['code']??0)>=300)out(['ok'=>false,'error'=>openai_error_message($rr)],502);
  $resp=json_decode((string)$rr['raw'],true); $txt=''; foreach(($resp['output']??[]) as $it)foreach(($it['content']??[]) as $cc)if(($cc['type']??'')==='output_text')$txt.=(string)($cc['text']??'');
  out(['ok'=>true,'message'=>trim($txt)?:'Connected','model'=>(string)cfg('openai_model')]);
case 'save_settings':admin();$d=input();$st=jr('settings.json',[]);foreach(['defaultBpm','defaultKey','sampleLibrary','sourceBookmarks'] as $k)if(isset($d['settings'])&&array_key_exists($k,$d['settings']))$st[$k]=$d['settings'][$k];jw('settings.json',$st);out(['ok'=>true,'settings'=>$st]);
case 'users':admin();out(['ok'=>true,'users'=>array_map(fn($u)=>['id'=>$u['id'],'email'=>$u['email'],'name'=>$u['name']??'','role'=>$u['role']??'user','disabled'=>!empty($u['disabled'])],jr('users.json',[]))]);
case 'save_user':admin();$d=input();$email=strtolower(clean($d['email']??'',200));if(!filter_var($email,FILTER_VALIDATE_EMAIL))out(['ok'=>false,'error'=>'Valid email required.'],422);$rows=jr('users.json',[]);$id=clean($d['id']??'',100)?:uid('usr');$hit=false;foreach($rows as $i=>$u)if(($u['id']??'')===$id){$rows[$i]['email']=$email;$rows[$i]['name']=clean($d['name']??$email,200);$rows[$i]['role']=($d['role']??'')==='admin'?'admin':'user';$rows[$i]['disabled']=!empty($d['disabled']);if(!empty($d['password']))$rows[$i]['passwordHash']=password_hash((string)$d['password'],PASSWORD_DEFAULT);$hit=true;break;}if(!$hit){if(strlen((string)($d['password']??''))<10)out(['ok'=>false,'error'=>'New user password must be at least 10 characters.'],422);$rows[]=['id'=>$id,'email'=>$email,'name'=>clean($d['name']??$email,200),'role'=>($d['role']??'')==='admin'?'admin':'user','disabled'=>false,'passwordHash'=>password_hash((string)$d['password'],PASSWORD_DEFAULT),'createdAt'=>gmdate('c')];}jw('users.json',$rows);out(['ok'=>true]);
case 'change_password':$d=input();$cur=(string)($d['currentPassword']??'');$new=(string)($d['newPassword']??'');if(strlen($new)<10)out(['ok'=>false,'error'=>'New password must be at least 10 characters.'],422);$rows=jr('users.json',[]);foreach($rows as $i=>$u)if(($u['id']??'')===$me['id']){if(!password_verify($cur,(string)$u['passwordHash']))out(['ok'=>false,'error'=>'Current password is incorrect.'],401);$rows[$i]['passwordHash']=password_hash($new,PASSWORD_DEFAULT);$rows[$i]['passwordChangedAt']=gmdate('c');jw('users.json',$rows);audit('change_password');out(['ok'=>true]);}out(['ok'=>false,'error'=>'User not found.'],404);
case 'upload':if(empty($_FILES['file']['tmp_name']))out(['ok'=>false,'error'=>'Choose a file first.'],422);$f=$_FILES['file'];if(($f['size']??0)>(int)cfg('max_upload_bytes'))out(['ok'=>false,'error'=>'File too large.'],413);$name=basename((string)$f['name']);$ext=strtolower(pathinfo($name,PATHINFO_EXTENSION));$allowed=['pdf','mid','midi','musicxml','mxl','xml','mp3','wav','m4a','ogg','flac','png','jpg','jpeg','webp','json'];if(!in_array($ext,$allowed,true))out(['ok'=>false,'error'=>'Unsupported file type.'],415);$id=uid('media');$stored=$id.'.'.$ext;$dest=MUSIC63_STORAGE.'/uploads/'.$stored;if(!move_uploaded_file($f['tmp_name'],$dest))out(['ok'=>false,'error'=>'Upload failed.'],500);$mime=function_exists('mime_content_type')?(mime_content_type($dest)?:'application/octet-stream'):'application/octet-stream';$m=['id'=>$id,'name'=>$name,'stored'=>$stored,'mime'=>$mime,'size'=>(int)$f['size'],'uploadedAt'=>gmdate('c'),'user'=>$me['email']];$rows=jr('media.json',[]);$rows[]=$m;jw('media.json',$rows);out(['ok'=>true,'media'=>$m,'url'=>'api.php?action=media&id='.rawurlencode($id)]);
case 'backup':admin();header('Content-Type: application/json');header('Content-Disposition: attachment; filename="music63-backup-'.gmdate('Ymd-His').'.json"');echo json_encode(['format'=>'music63-backup-v1','exportedAt'=>gmdate('c'),'songs'=>jr('songs.json',[]),'settings'=>jr('settings.json',[]),'media'=>jr('media.json',[])],JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);exit;
case 'restore':admin();$b=input()['backup']??null;if(!is_array($b)||($b['format']??'')!=='music63-backup-v1')out(['ok'=>false,'error'=>'Invalid backup.'],422);if(isset($b['songs']))jw('songs.json',array_values($b['songs']));if(isset($b['settings']))jw('settings.json',$b['settings']);out(['ok'=>true]);
case 'ai_read_score_photo':
  $key=(string)cfg('openai_api_key');
  if(!$key)out(['ok'=>false,'error'=>'AI is not configured on the server. Manual photo tracing is still available in the editor.'],409);
  if(empty($_FILES['file']['tmp_name']))out(['ok'=>false,'error'=>'Choose a score image first.'],422);
  $f=$_FILES['file'];
  if(($f['size']??0)>12*1024*1024)out(['ok'=>false,'error'=>'Image is too large (12 MB maximum).'],413);
  $mime=function_exists('mime_content_type')?(mime_content_type($f['tmp_name'])?:''):($f['type']??'');
  if(!in_array($mime,['image/jpeg','image/png','image/webp'],true))out(['ok'=>false,'error'=>'Use JPG, PNG or WebP for handwritten score reading.'],415);
  $img=@file_get_contents($f['tmp_name']);
  if($img===false)out(['ok'=>false,'error'=>'Unable to read uploaded image.'],500);
  $instrument=clean($_POST['instrument']??'Piano',100);
  $hintKey=clean($_POST['key']??'C',20);
  $schema=['type'=>'object','properties'=>[
    'key'=>['type'=>'string'],
    'timeSignature'=>['type'=>'string'],
    'confidence'=>['type'=>'number'],
    'warnings'=>['type'=>'array','items'=>['type'=>'string']],
    'chords'=>['type'=>'array','items'=>['type'=>'object','properties'=>['bar'=>['type'=>'integer'],'beat'=>['type'=>'number'],'symbol'=>['type'=>'string']],'required'=>['bar','beat','symbol'],'additionalProperties'=>false]],
    'notes'=>['type'=>'array','items'=>['type'=>'object','properties'=>['bar'=>['type'=>'integer'],'beat'=>['type'=>'number'],'duration'=>['type'=>'number'],'midi'=>['type'=>'integer'],'lyric'=>['type'=>'string'],'rest'=>['type'=>'boolean'],'confidence'=>['type'=>'number']],'required'=>['bar','beat','duration','midi','lyric','rest','confidence'],'additionalProperties'=>false]]
  ],'required'=>['key','timeSignature','confidence','warnings','chords','notes'],'additionalProperties'=>false];
  $instructions="Transcribe the handwritten sheet-music photo into structured notation for a private music editor. Instrument: {$instrument}. Current key hint: {$hintKey}. Read WRITTEN pitch exactly as notated on the staff; do not transpose Bb/Eb instruments to concert pitch. Follow every visible staff system from left to right and top to bottom, continuing bar numbers sequentially across systems. Detect clef, time signature, bar lines, noteheads, stems, beams, rests, accidentals, ties/slurs only when they affect duration/pitch, and chord symbols. Use quarter-note beat units: quarter=1, eighth=0.5, sixteenth=0.25, half=2, whole=4. Number bars from 1 and beats from 1. MIDI values must represent the written notes shown. Include rests. Give each note/rest a confidence from 0 to 1. Copy chord symbols only when clearly visible. Ignore prose/handwriting that is not lyrics or chord symbols. Be conservative: if uncertain, prefer fewer notes, lower the per-note confidence, and explain uncertainty in warnings. Never invent missing measures.";
  $body=[
    'model'=>cfg('openai_model'),
    'input'=>[['role'=>'user','content'=>[
      ['type'=>'input_text','text'=>$instructions],
      ['type'=>'input_image','image_url'=>'data:'.$mime.';base64,'.base64_encode($img),'detail'=>'high']
    ]]],
    'text'=>['format'=>['type'=>'json_schema','name'=>'music63_score_photo','strict'=>true,'schema'=>$schema]]
  ];
  $rr=openai_http($body,90); $code=(int)($rr['code']??0); $raw=(string)($rr['raw']??'');
  if($code<200||$code>=300)out(['ok'=>false,'error'=>openai_error_message($rr)],502);
  $resp=json_decode($raw,true);$txt='';
  foreach(($resp['output']??[]) as $it)foreach(($it['content']??[]) as $cc)if(($cc['type']??'')==='output_text')$txt.=(string)($cc['text']??'');
  $score=json_decode($txt,true);
  if(!is_array($score))out(['ok'=>false,'error'=>'Unexpected AI score-photo format.'],502);
  out(['ok'=>true,'score'=>$score]);
case 'ai_compose':
  $key=(string)cfg('openai_api_key'); if(!$key)out(['ok'=>false,'error'=>'AI is not configured on the server. Offline Smart Composer is available.'],409);
  $d=input(); $prompt=clean($d['prompt']??'',4000); $style=clean($d['style']??'Latvian melodic pop',200);
  $instruments=is_array($d['instruments']??null)?array_values(array_slice($d['instruments'],0,8)):['Piano','Clarinet Bb']; $bars=max(4,min(16,(int)($d['bars']??8)));
  $schema=['type'=>'object','properties'=>['title'=>['type'=>'string'],'key'=>['type'=>'string'],'mode'=>['type'=>'string','enum'=>['major','minor']],'bpm'=>['type'=>'integer'],'chords'=>['type'=>'array','items'=>['type'=>'object','properties'=>['bar'=>['type'=>'integer'],'beat'=>['type'=>'number'],'symbol'=>['type'=>'string']],'required'=>['bar','beat','symbol'],'additionalProperties'=>false]],'melody'=>['type'=>'array','items'=>['type'=>'object','properties'=>['bar'=>['type'=>'integer'],'beat'=>['type'=>'number'],'duration'=>['type'=>'number'],'midi'=>['type'=>'integer'],'lyric'=>['type'=>'string']],'required'=>['bar','beat','duration','midi','lyric'],'additionalProperties'=>false]],'arrangementNotes'=>['type'=>'array','items'=>['type'=>'string']]],'required'=>['title','key','mode','bpm','chords','melody','arrangementNotes'],'additionalProperties'=>false];
  $body=['model'=>cfg('openai_model'),'input'=>[['role'=>'system','content'=>'Create an original, singable melody and playable harmony for a private notation app. Avoid copying recognizable copyrighted melodies. MIDI range 48-84, 4/4. Return structured score data only.'],['role'=>'user','content'=>"Create {$bars} bars. Style: {$style}. Instruments: ".implode(', ',$instruments).". Idea: {$prompt}"]],'text'=>['format'=>['type'=>'json_schema','name'=>'music63_composition','strict'=>true,'schema'=>$schema]]];
  $rr=openai_http($body,60); $code=(int)($rr['code']??0); if($code<200||$code>=300)out(['ok'=>false,'error'=>openai_error_message($rr)],502);
  $resp=json_decode((string)$rr['raw'],true); $txt=''; foreach(($resp['output']??[]) as $it)foreach(($it['content']??[]) as $c)if(($c['type']??'')==='output_text')$txt.=(string)($c['text']??'');
  $comp=json_decode($txt,true); if(!is_array($comp))out(['ok'=>false,'error'=>'Unexpected AI score format.'],502); out(['ok'=>true,'composition'=>$comp]);

default:out(['ok'=>false,'error'=>'Unknown action.'],404);
}
