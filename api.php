<?php
declare(strict_types=1);require __DIR__.'/includes/bootstrap.php';$a=$_GET['action']??'';
if($a==='status'){$u=user();out(['ok'=>true,'authenticated'=>(bool)$u,'user'=>$u,'csrf'=>$u?csrf():null,'appName'=>cfg('app_name'),'aiConfigured'=>(bool)cfg('openai_api_key'),'aiModel'=>cfg('openai_model'),'aiSource'=>ai_source()]);}
if($a==='login'&&$_SERVER['REQUEST_METHOD']==='POST'){$d=input();$email=strtolower(clean($d['email']??'',200));$pw=(string)($d['password']??'');$found=null;foreach(jr('users.json',[]) as $u)if(strtolower((string)($u['email']??''))===$email&&!empty($u['passwordHash'])&&empty($u['disabled'])){$found=$u;break;}if(!$found||!password_verify($pw,$found['passwordHash'])){usleep(200000);out(['ok'=>false,'error'=>'Email or password is incorrect.'],401);}session_regenerate_id(true);$_SESSION['uid']=$found['id'];$_SESSION['csrf']=bin2hex(random_bytes(24));audit('login');out(['ok'=>true,'user'=>user(),'csrf'=>csrf()]);}
if($a==='media'){auth();$id=clean($_GET['id']??'',100);foreach(jr('media.json',[]) as $m)if(($m['id']??'')===$id){$p=MUSIC63_STORAGE.'/uploads/'.basename($m['stored']);if(!is_file($p))out(['ok'=>false,'error'=>'File not found.'],404);header('Content-Type: '.($m['mime']??'application/octet-stream'));header('Content-Length: '.filesize($p));header('Content-Disposition: inline; filename="'.rawurlencode($m['name']??'file').'"');readfile($p);exit;}out(['ok'=>false,'error'=>'File not found.'],404);}
$me=auth();if($_SERVER['REQUEST_METHOD']!=='GET')check_csrf();
function ffmpeg_path(){
  $disabled=array_map('trim',explode(',',(string)ini_get('disable_functions')));
  if(in_array('shell_exec',$disabled,true)||in_array('exec',$disabled,true)||!function_exists('shell_exec')||!function_exists('exec'))return '';
  $p=trim((string)@shell_exec('command -v ffmpeg 2>/dev/null'));
  return ($p!==''&&is_executable($p))?$p:'';
}
function media_owned_row($id,$me){foreach(jr('media.json',[]) as $m)if(($m['id']??'')===$id){if(($me['role']??'')!=='admin'&&($m['user']??'')!==($me['email']??''))out(['ok'=>false,'error'=>'You can only edit your own uploaded files.'],403);return $m;}out(['ok'=>false,'error'=>'File not found.'],404);}
function ini_bytes_v22($v){$v=trim((string)$v);if($v===''||$v==='-1')return -1;$n=(float)$v;$u=strtolower(substr($v,-1));if($u==='g')$n*=1024*1024*1024;elseif($u==='m')$n*=1024*1024;elseif($u==='k')$n*=1024;return (int)$n;}
function response_text_v22(array $resp){if(isset($resp['output_text'])&&is_string($resp['output_text']))return trim($resp['output_text']);$txt='';foreach(($resp['output']??[]) as $it)foreach(($it['content']??[]) as $cc)if(($cc['type']??'')==='output_text')$txt.=(string)($cc['text']??'');return trim($txt);}
switch($a){
case 'logout':audit('logout');$_SESSION=[];session_destroy();out(['ok'=>true]);
case 'songs':$s=jr('songs.json',[]);usort($s,fn($x,$y)=>strcmp((string)($y['updatedAt']??''),(string)($x['updatedAt']??'')));out(['ok'=>true,'songs'=>$s]);
case 'save_song':$d=input();$song=song_norm(is_array($d['song']??null)?$d['song']:[]);$rows=jr('songs.json',[]);$hit=false;foreach($rows as $i=>$r)if(($r['id']??'')===$song['id']){$song['createdAt']=$r['createdAt']??$song['createdAt'];$rows[$i]=$song;$hit=true;break;}if(!$hit)$rows[]=$song;jw('songs.json',$rows);audit('save_song',['songId'=>$song['id']]);out(['ok'=>true,'song'=>$song]);
case 'delete_song':$id=clean(input()['id']??'',100);jw('songs.json',array_values(array_filter(jr('songs.json',[]),fn($s)=>($s['id']??'')!==$id)));audit('delete_song',['songId'=>$id]);out(['ok'=>true]);
case 'settings':out(['ok'=>true,'settings'=>jr('settings.json',[])]);
case 'media_tools_status':
  out(['ok'=>true,'ffmpeg'=>(bool)ffmpeg_path()]);
case 'media_edit_export':
  $d=input();$id=clean($d['id']??'',100);$fmt=strtolower(clean($d['format']??'wav',10));if(!in_array($fmt,['wav','mp4'],true))out(['ok'=>false,'error'=>'Use WAV or MP4 output.'],422);
  $m=media_owned_row($id,$me);$src=MUSIC63_STORAGE.'/uploads/'.basename((string)($m['stored']??''));if(!is_file($src))out(['ok'=>false,'error'=>'Source file is missing.'],404);
  $ff=ffmpeg_path();if(!$ff)out(['ok'=>false,'error'=>'FFmpeg is not available on this hosting plan. Use browser WAV/backing export, or enable FFmpeg on the server.'],503);
  $start=max(0,(float)($d['start']??0));$end=max(0,(float)($d['end']??0));$vol=max(0,min(3,(float)($d['volume']??1)));$dur=($end>$start)?($end-$start):0;
  $outId=uid('media');$ext=$fmt;$stored=$outId.'.'.$ext;$dest=MUSIC63_STORAGE.'/uploads/'.$stored;
  $qff=escapeshellarg($ff);$qsrc=escapeshellarg($src);$qdest=escapeshellarg($dest);$ss=$start>0?' -ss '.escapeshellarg(number_format($start,3,'.','')):'';$tt=$dur>0?' -t '.escapeshellarg(number_format($dur,3,'.','')):'';$vf='volume='.number_format($vol,3,'.','');
  if($fmt==='wav'){$cmd="$qff -hide_banner -loglevel error -y$ss -i $qsrc$tt -vn -filter:a ".escapeshellarg($vf)." -c:a pcm_s16le $qdest 2>&1";}
  else{
    $mime=strtolower((string)($m['mime']??''));$name=strtolower((string)($m['name']??''));$video=str_starts_with($mime,'video/')||preg_match('/\\.(mp4|mov|m4v|webm)$/',$name);
    if($video)$cmd="$qff -hide_banner -loglevel error -y$ss -i $qsrc$tt -filter:a ".escapeshellarg($vf)." -c:v copy -c:a aac -b:a 192k -movflags +faststart $qdest 2>&1";
    else{$blackDur=$dur>0?$dur:3600;$cmd="$qff -hide_banner -loglevel error -y$ss -i $qsrc -f lavfi -i color=c=black:s=1280x720:r=25 -t ".escapeshellarg(number_format($blackDur,3,'.',''))." -filter:a ".escapeshellarg($vf)." -map 1:v:0 -map 0:a:0 -c:v mpeg4 -q:v 5 -c:a aac -b:a 192k -shortest -movflags +faststart $qdest 2>&1";}
  }
  $log=[];$rc=0;@exec($cmd,$log,$rc);if($rc!==0||!is_file($dest)||filesize($dest)<100)out(['ok'=>false,'error'=>'Media export failed: '.clean(implode(' ',array_slice($log,-4)),500)],500);
  $nameBase=preg_replace('/\\.[^.]+$/','',(string)($m['name']??'media'));$new=['id'=>$outId,'name'=>$nameBase.'-edited.'.$ext,'stored'=>$stored,'mime'=>$fmt==='wav'?'audio/wav':'video/mp4','size'=>filesize($dest),'uploadedAt'=>gmdate('c'),'user'=>$me['email']];$rows=jr('media.json',[]);$rows[]=$new;jw('media.json',$rows);audit('media_edit_export',['sourceId'=>$id,'mediaId'=>$outId,'format'=>$fmt]);out(['ok'=>true,'media'=>$new,'url'=>'api.php?action=media&id='.rawurlencode($outId)]);
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
case 'clear_ui_translation_cache':
  admin();
  $cp=MUSIC63_STORAGE.'/private/ui-i18n.json';
  if(is_file($cp))@unlink($cp);
  audit('clear_ui_translation_cache');
  out(['ok'=>true]);
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
case 'upload':if(empty($_FILES['file']['tmp_name']))out(['ok'=>false,'error'=>'Choose a file first.'],422);$f=$_FILES['file'];if(($f['size']??0)>(int)cfg('max_upload_bytes'))out(['ok'=>false,'error'=>'File too large.'],413);$name=basename((string)$f['name']);$ext=strtolower(pathinfo($name,PATHINFO_EXTENSION));$allowed=['pdf','mid','midi','musicxml','mxl','xml','mp3','wav','m4a','aac','ogg','flac','mp4','webm','mov','m4v','png','jpg','jpeg','webp','json'];if(!in_array($ext,$allowed,true))out(['ok'=>false,'error'=>'Unsupported file type.'],415);$id=uid('media');$stored=$id.'.'.$ext;$dest=MUSIC63_STORAGE.'/uploads/'.$stored;if(!move_uploaded_file($f['tmp_name'],$dest))out(['ok'=>false,'error'=>'Upload failed.'],500);$mime=function_exists('mime_content_type')?(mime_content_type($dest)?:'application/octet-stream'):'application/octet-stream';$m=['id'=>$id,'name'=>$name,'stored'=>$stored,'mime'=>$mime,'size'=>(int)$f['size'],'uploadedAt'=>gmdate('c'),'user'=>$me['email']];$rows=jr('media.json',[]);$rows[]=$m;jw('media.json',$rows);out(['ok'=>true,'media'=>$m,'url'=>'api.php?action=media&id='.rawurlencode($id)]);
case 'backup':admin();header('Content-Type: application/json');header('Content-Disposition: attachment; filename="music63-backup-'.gmdate('Ymd-His').'.json"');echo json_encode(['format'=>'music63-backup-v1','exportedAt'=>gmdate('c'),'songs'=>jr('songs.json',[]),'settings'=>jr('settings.json',[]),'media'=>jr('media.json',[])],JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);exit;
case 'restore':admin();$b=input()['backup']??null;if(!is_array($b)||($b['format']??'')!=='music63-backup-v1')out(['ok'=>false,'error'=>'Invalid backup.'],422);if(isset($b['songs']))jw('songs.json',array_values($b['songs']));if(isset($b['settings']))jw('settings.json',$b['settings']);out(['ok'=>true]);
case 'ai_photo_status':
  out(['ok'=>true,'configured'=>(bool)cfg('openai_api_key'),'model'=>(string)cfg('openai_model'),'source'=>ai_source(),'curl'=>function_exists('curl_init'),'maxExecutionTime'=>(int)ini_get('max_execution_time'),'memoryLimit'=>(string)ini_get('memory_limit'),'uploadMax'=>(string)ini_get('upload_max_filesize'),'postMax'=>(string)ini_get('post_max_size')]);
case 'test_ai_vision':
  if(!cfg('openai_api_key'))out(['ok'=>false,'error'=>'Add an OpenAI API key in Settings first.'],409);
  @set_time_limit(90);
  $body=['model'=>(string)cfg('openai_model'),'input'=>[['role'=>'user','content'=>[['type'=>'input_text','text'=>'This is a tiny image-input connection test. Reply with exactly IMAGE_OK.'],['type'=>'input_image','image_url'=>'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGUlEQVR4nGP8//8/AymAiSTVoxpGNQwpDQBVbQMdPVIhQwAAAABJRU5ErkJggg==','detail'=>'low']]]],'max_output_tokens'=>20];
  $rr=openai_http($body,60); if(($rr['code']??0)<200||($rr['code']??0)>=300)out(['ok'=>false,'error'=>openai_error_message($rr)],502);
  $resp=json_decode((string)$rr['raw'],true);$txt=is_array($resp)?response_text_v22($resp):'';audit('test_ai_vision',['model'=>(string)cfg('openai_model')]);out(['ok'=>true,'message'=>$txt?:'IMAGE_OK','model'=>(string)cfg('openai_model')]);
case 'ai_read_score_photo':
  $key=(string)cfg('openai_api_key');
  if(!$key)out(['ok'=>false,'error'=>'AI is not configured on the server. Open Settings → AI connection first.'],409);
  @ignore_user_abort(true);@set_time_limit(210);
  $contentLength=(int)($_SERVER['CONTENT_LENGTH']??0);$postMax=ini_bytes_v22(ini_get('post_max_size'));
  if($postMax>0&&$contentLength>$postMax)out(['ok'=>false,'error'=>'The prepared photo request is larger than the server post_max_size ('.ini_get('post_max_size').'). Reduce image quality or ask hosting support to increase the PHP limit.'],413);
  if(empty($_FILES['file']['tmp_name']))out(['ok'=>false,'error'=>'Choose a score image first. If you already selected one, the server may have rejected the upload size.'],422);
  $instrument=clean($_POST['instrument']??'Piano',100);$hintKey=clean($_POST['key']??'C',20);$readMode=clean($_POST['readMode']??'melody_chords',30);$quality=clean($_POST['quality']??'high',20);
  if(!in_array($readMode,['melody_chords','melody','all'],true))$readMode='melody_chords';if(!in_array($quality,['standard','high'],true))$quality='high';
  $images=[];$totalBytes=0;$fields=['file','enhanced','crop0','crop1','crop2','crop3'];
  foreach($fields as $field){if(empty($_FILES[$field]['tmp_name']))continue;$f=$_FILES[$field];if(($f['error']??UPLOAD_ERR_OK)!==UPLOAD_ERR_OK)continue;if(($f['size']??0)>12*1024*1024)out(['ok'=>false,'error'=>'One prepared score image is larger than 12 MB.'],413);$mime=function_exists('mime_content_type')?(mime_content_type($f['tmp_name'])?:''):($f['type']??'');if(!in_array($mime,['image/jpeg','image/png','image/webp'],true))out(['ok'=>false,'error'=>'Use JPG, PNG or WebP for handwritten score reading.'],415);$img=@file_get_contents($f['tmp_name']);if($img===false)continue;$totalBytes+=strlen($img);if($totalBytes>22*1024*1024)out(['ok'=>false,'error'=>'Prepared handwriting images are too large. Use Standard quality or a smaller photo.'],413);$images[]=['field'=>$field,'mime'=>$mime,'data'=>$img];}
  if(!$images)out(['ok'=>false,'error'=>'The score image could not be read by the server.'],500);
  $schema=['type'=>'object','properties'=>[
    'key'=>['type'=>'string'],'timeSignature'=>['type'=>'string'],'staffSystems'=>['type'=>'integer'],'barCount'=>['type'=>'integer'],'confidence'=>['type'=>'number'],'warnings'=>['type'=>'array','items'=>['type'=>'string']],
    'chords'=>['type'=>'array','items'=>['type'=>'object','properties'=>['bar'=>['type'=>'integer'],'beat'=>['type'=>'number'],'symbol'=>['type'=>'string']],'required'=>['bar','beat','symbol'],'additionalProperties'=>false]],
    'notes'=>['type'=>'array','items'=>['type'=>'object','properties'=>['bar'=>['type'=>'integer'],'beat'=>['type'=>'number'],'duration'=>['type'=>'number'],'midi'=>['type'=>'integer'],'lyric'=>['type'=>'string'],'rest'=>['type'=>'boolean'],'confidence'=>['type'=>'number']],'required'=>['bar','beat','duration','midi','lyric','rest','confidence'],'additionalProperties'=>false]]
  ],'required'=>['key','timeSignature','staffSystems','barCount','confidence','warnings','chords','notes'],'additionalProperties'=>false];
  $modeText=$readMode==='melody'?'Read the main melody only. Ignore chord symbols and accompaniment.':($readMode==='all'?'Read every clearly visible note/rest on the selected staff system(s), plus clear chord symbols.':'Read the main melody line and separately copy clear chord symbols. Do not turn chord letters into melody notes.');
  $instructions="You are doing optical music recognition from a photographed HANDWRITTEN score for a private notation editor. Instrument: {{$instrument}}. Current key hint: {{$hintKey}}. {{$modeText}} Read WRITTEN pitch exactly as drawn; never transpose Bb/Eb instruments to concert pitch. The supplied images are the SAME PAGE: first the original page, then an enhanced copy and optional overlapping zoom strips. Use the original to understand page order and the zoom strips only to read small symbols. NEVER duplicate notes just because the same note appears in two overlapping images. Follow staff systems left-to-right, top-to-bottom and continue bar numbers sequentially. Detect clef, time signature, bar lines, noteheads, stems, beams, rests and accidentals. Use quarter-note beat units: whole=4, half=2, quarter=1, eighth=0.5, sixteenth=0.25, thirty-second=0.125. Beats start at 1. MIDI is the WRITTEN note pitch. For a rest use midi=60 only as a placeholder and rest=true. Preserve repeated notes when they are genuinely written. Give each symbol confidence 0..1. Ignore freehand comments unless they are chord symbols or lyrics. If the page is slanted, infer staff geometry from all five staff lines rather than from the photo edge. Be conservative but DO return readable notes instead of an empty list when noteheads are visibly present. Explain uncertain bars in warnings.";
  $content=[['type'=>'input_text','text'=>$instructions]];$labels=['file'=>'Original full page','enhanced'=>'Auto-enhanced full page','crop0'=>'Zoom strip 1 (top)','crop1'=>'Zoom strip 2','crop2'=>'Zoom strip 3','crop3'=>'Zoom strip 4 (bottom)'];
  foreach($images as $im){$content[]=['type'=>'input_text','text'=>($labels[$im['field']]??'Additional score view').'. It is part of the same page.'];$content[]=['type'=>'input_image','image_url'=>'data:'.$im['mime'].';base64,'.base64_encode($im['data']),'detail'=>'high'];}
  $body=['model'=>cfg('openai_model'),'input'=>[['role'=>'user','content'=>$content]],'reasoning'=>['effort'=>$quality==='high'?'medium':'low'],'max_output_tokens'=>12000,'text'=>['format'=>['type'=>'json_schema','name'=>'music63_score_photo_v22','strict'=>true,'schema'=>$schema]]];
  $started=microtime(true);$rr=openai_http($body,$quality==='high'?180:125);$code=(int)($rr['code']??0);
  if($code===400&&stripos((string)($rr['raw']??''),'reasoning')!==false){unset($body['reasoning']);$rr=openai_http($body,$quality==='high'?180:125);$code=(int)($rr['code']??0);}
  if($code<200||$code>=300){$err=openai_error_message($rr);audit('ai_read_score_photo_error',['model'=>(string)cfg('openai_model'),'code'=>$code,'images'=>count($images),'error'=>clean($err,180)]);out(['ok'=>false,'error'=>'Handwriting reader: '.$err,'diagnostics'=>['model'=>(string)cfg('openai_model'),'images'=>count($images),'elapsedMs'=>(int)((microtime(true)-$started)*1000)]],502);}
  $resp=json_decode((string)$rr['raw'],true);$txt=is_array($resp)?response_text_v22($resp):'';$score=json_decode($txt,true);
  if(!is_array($score)){$status=is_array($resp)?clean($resp['status']??'',40):'';$why=is_array($resp)?clean($resp['incomplete_details']['reason']??'',120):'';audit('ai_read_score_photo_bad_output',['model'=>(string)cfg('openai_model'),'status'=>$status,'reason'=>$why]);out(['ok'=>false,'error'=>'The AI vision request completed but did not return usable score JSON'.($why?(' ('.$why.')'):'').'. Try “Prepare image” and High accuracy, or test the AI reader in the handwriting panel.'],502);}
  $score['notes']=is_array($score['notes']??null)?$score['notes']:[];$score['chords']=is_array($score['chords']??null)?$score['chords']:[];$score['warnings']=is_array($score['warnings']??null)?$score['warnings']:[];
  if(!$score['notes'])$score['warnings'][]='No note symbols were confidently decoded. Try High accuracy, rotate/prepare the photo, or crop closer to the handwritten staves.';
  $diag=['model'=>(string)cfg('openai_model'),'images'=>count($images),'quality'=>$quality,'bytes'=>$totalBytes,'elapsedMs'=>(int)((microtime(true)-$started)*1000)];audit('ai_read_score_photo',['notes'=>count($score['notes']),'chords'=>count($score['chords']),'images'=>count($images),'quality'=>$quality]);out(['ok'=>true,'score'=>$score,'diagnostics'=>$diag]);
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
