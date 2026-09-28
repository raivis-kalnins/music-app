<?php
declare(strict_types=1);
$config=require __DIR__.'/../config.php';
define('MUSIC63_ROOT',dirname(__DIR__)); define('MUSIC63_STORAGE',$config['storage_dir']);
function ai_secret_path(){return MUSIC63_STORAGE.'/private/openai.json';}
function ai_secret_read(){
  $p=ai_secret_path(); if(!is_file($p))return [];
  $raw=@file_get_contents($p); $d=json_decode((string)$raw,true);
  return is_array($d)?$d:[];
}
function ai_secret_write(array $d){
  @mkdir(MUSIC63_STORAGE.'/private',0770,true);
  $deny="<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n";
  $ht=MUSIC63_STORAGE.'/private/.htaccess'; if(!is_file($ht))@file_put_contents($ht,$deny,LOCK_EX);
  $p=ai_secret_path(); $tmp=$p.'.tmp.'.bin2hex(random_bytes(4));
  $raw=json_encode($d,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
  if(file_put_contents($tmp,$raw,LOCK_EX)===false)throw new RuntimeException('Unable to save AI connection settings.');
  @chmod($tmp,0600); if(!@rename($tmp,$p)){@unlink($tmp);throw new RuntimeException('Unable to replace AI connection settings.');} @chmod($p,0600);
}
function cfg(?string $k=null){
  global $config;
  if($k==='openai_api_key'){
    $env=(string)($config['openai_api_key']??''); if($env!=='')return $env;
    $d=ai_secret_read(); return (string)($d['apiKey']??'');
  }
  if($k==='openai_model'){
    $d=ai_secret_read(); if(!empty($d['model']))return (string)$d['model'];
    return (string)($config['openai_model']??'gpt-5.6-terra');
  }
  return $k===null?$config:($config[$k]??null);
}
function ai_source(){
  global $config; if(!empty($config['openai_api_key']))return 'environment';
  return !empty(ai_secret_read()['apiKey'])?'saved':'none';
}
function ai_masked_key(){
  $k=(string)cfg('openai_api_key'); if($k==='')return '';
  $n=strlen($k); if($n<=8)return str_repeat('•',max(4,$n));
  return substr($k,0,3).str_repeat('•',min(18,$n-7)).substr($k,-4);
}
function openai_http(array $body,int $timeout=90){
  $key=(string)cfg('openai_api_key'); if($key==='')return ['code'=>0,'raw'=>'','error'=>'OpenAI API key is not configured.'];
  $payload=json_encode($body,JSON_UNESCAPED_SLASHES);
  if($payload===false)return ['code'=>0,'raw'=>'','error'=>'Unable to encode OpenAI request.'];
  if(function_exists('curl_init')){
    $ch=curl_init('https://api.openai.com/v1/responses');
    curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>15,CURLOPT_TIMEOUT=>$timeout,CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$key,'Content-Type: application/json'],CURLOPT_POSTFIELDS=>$payload]);
    $raw=curl_exec($ch); $err=$raw===false?curl_error($ch):''; $code=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
    return ['code'=>$code,'raw'=>$raw===false?'':(string)$raw,'error'=>$err];
  }
  $ctx=stream_context_create(['http'=>['method'=>'POST','timeout'=>$timeout,'ignore_errors'=>true,'header'=>"Authorization: Bearer {$key}\r\nContent-Type: application/json\r\n",'content'=>$payload]]);
  $raw=@file_get_contents('https://api.openai.com/v1/responses',false,$ctx); $code=0;
  foreach(($http_response_header??[]) as $h)if(preg_match('/^HTTP\/\S+\s+(\d+)/',$h,$m))$code=(int)$m[1];
  return ['code'=>$code,'raw'=>$raw===false?'':(string)$raw,'error'=>$raw===false?'OpenAI request could not be sent.':''];
}
function openai_error_message(array $r){
  $d=json_decode((string)($r['raw']??''),true); $msg=is_array($d)?(string)($d['error']['message']??''):'';
  $msg=clean($msg,500); if($msg!=='')return $msg;
  if(!empty($r['error']))return clean((string)$r['error'],500);
  return 'OpenAI request failed (HTTP '.(int)($r['code']??0).').';
}
function headers_secure(){header('X-Content-Type-Options: nosniff');header('X-Frame-Options: DENY');header('Referrer-Policy: strict-origin-when-cross-origin');header("Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=(), midi=(self)");header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://cdn.jsdelivr.net; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com; object-src 'none'; frame-ancestors 'none'; form-action 'self'");}
function session_secure(){if(session_status()===PHP_SESSION_ACTIVE)return;$secure=!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off';session_name((string)cfg('session_name'));session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);session_start();}
function sf($n){return MUSIC63_STORAGE.'/'.basename($n);} 
function jr($n,$fallback=[]){$p=sf($n);if(!is_file($p))return $fallback;$raw=@file_get_contents($p);$d=json_decode((string)$raw,true);return is_array($d)?$d:$fallback;}
function jw($n,$d){$p=sf($n);$tmp=$p.'.tmp.'.bin2hex(random_bytes(4));$raw=json_encode($d,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);if(file_put_contents($tmp,$raw,LOCK_EX)===false)throw new RuntimeException('Storage write failed');@chmod($tmp,0660);if(!@rename($tmp,$p)){@unlink($tmp);throw new RuntimeException('Storage replace failed');}}
function ensure_storage(){@mkdir(MUSIC63_STORAGE.'/uploads',0770,true);@mkdir(MUSIC63_STORAGE.'/private',0770,true);$deny="<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n";$ht=MUSIC63_STORAGE.'/private/.htaccess';if(!is_file($ht))@file_put_contents($ht,$deny,LOCK_EX);foreach(['users.json'=>[],'songs.json'=>[],'media.json'=>[],'audit.json'=>[],'login-attempts.json'=>[],'settings.json'=>['defaultBpm'=>92,'defaultKey'=>'C','sampleLibrary'=>[],'sourceBookmarks'=>[]]] as $f=>$d)if(!is_file(sf($f)))jw($f,$d);}
function out($d,$status=200){http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode($d,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function input(){return json_decode(file_get_contents('php://input')?:'{}',true)?:[];} 
function clean($v,$m=2000){$s=trim((string)$v);$s=preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u','',$s)??'';return function_exists('mb_substr')?mb_substr($s,0,$m):substr($s,0,$m);} 
function uid($p='id'){return $p.'_'.bin2hex(random_bytes(8));}
function user(){if(empty($_SESSION['uid']))return null;foreach(jr('users.json',[]) as $u)if(($u['id']??'')===$_SESSION['uid']&&empty($u['disabled']))return ['id'=>$u['id'],'email'=>$u['email'],'name'=>$u['name']??$u['email'],'role'=>$u['role']??'user'];return null;}
function auth(){return user()?:out(['ok'=>false,'error'=>'Authentication required.'],401);} function admin(){ $u=auth(); if(($u['role']??'')!=='admin')out(['ok'=>false,'error'=>'Administrator access required.'],403); return $u; }
function csrf(){if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));return $_SESSION['csrf'];} function check_csrf(){if(!hash_equals((string)($_SESSION['csrf']??''),(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')))out(['ok'=>false,'error'=>'Security token expired. Refresh and try again.'],419);} 
function audit($e,$meta=[]){$r=jr('audit.json',[]);$r[]=['at'=>gmdate('c'),'user'=>user()['email']??null,'event'=>$e,'meta'=>$meta];if(count($r)>500)$r=array_slice($r,-500);jw('audit.json',$r);} 
function song_norm($s){$parts=is_array($s['parts']??null)?array_values($s['parts']):[];foreach($parts as &$p){$p=is_array($p)?$p:[];$p['id']=clean($p['id']??uid('part'),80);$p['name']=clean($p['name']??'Part',120);$p['instrument']=clean($p['instrument']??'Piano',80);$p['notes']=is_array($p['notes']??null)?array_values(array_slice($p['notes'],0,10000)):[];}unset($p);return ['id'=>clean($s['id']??uid('song'),80),'title'=>clean($s['title']??'Untitled',200),'composer'=>clean($s['composer']??'',200),'artist'=>clean($s['artist']??'',200),'lyricist'=>clean($s['lyricist']??'',200),'year'=>clean($s['year']??'',20),'language'=>clean($s['language']??'lv',20),'key'=>clean($s['key']??'C',20),'mode'=>in_array(($s['mode']??'major'),['major','minor'],true)?($s['mode']??'major'):'major','bpm'=>max(20,min(300,(int)($s['bpm']??92))),'timeSignature'=>clean($s['timeSignature']??'4/4',10),'scoreBars'=>max(1,min(128,(int)($s['scoreBars']??8))),'barsPerRow'=>max(1,min(8,(int)($s['barsPerRow']??4))),'lyrics'=>clean($s['lyrics']??'',20000),'notesText'=>clean($s['notesText']??'',8000),'sourceUrl'=>clean($s['sourceUrl']??'',2000),'rightsNote'=>clean($s['rightsNote']??'Private/personal use. Verify rights before republishing.',1000),'chords'=>is_array($s['chords']??null)?array_values(array_slice($s['chords'],0,1000)):[],'parts'=>$parts,'attachments'=>is_array($s['attachments']??null)?array_values($s['attachments']):[],'createdAt'=>clean($s['createdAt']??gmdate('c'),40),'updatedAt'=>gmdate('c')];}
headers_secure();session_secure();ensure_storage();
