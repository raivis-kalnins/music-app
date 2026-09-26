<?php
return [
 'app_name'=>'Music 63 Studio',
 'storage_dir'=>__DIR__.'/storage',
 'session_name'=>'MUSIC63SESSID',
 'max_upload_bytes'=>25*1024*1024,
 'openai_api_key'=>getenv('OPENAI_API_KEY')?:'',
 'openai_model'=>getenv('OPENAI_MODEL')?:'gpt-5.6-terra',
];
