<?php
$roomid=$_GET["roomid"];
?>
<body style="padding: 0px;margin: 0px; overflow: hidden;">
    <iframe
        src="https://tokbox.com/embed/embed/ot-embed.js?embedId=9d958392-5a73-4ec9-b45d-6a93a59e202d&room=<?=$roomid?>&iframe=true"
        width=600
        height=600
        allow="microphone; camera"
        frameBorder="0"
    ></iframe>
</body>
    

<!-- <div id="otEmbedContainer" style="width:640px; height:640px"></div>
<script src="https://tokbox.com/embed/embed/ot-embed.js?embedId=9d958392-5a73-4ec9-b45d-6a93a59e202d&room=DEFAULT_ROOM"></script> -->

<!-- <iframe src="https://tokbox.com/embed/embed/ot-embed.js?embedId=b4628af2-a478-4cea-b535-b2a1d483a771&room='.$roomid.'&iframe=true" width="600px" height="600px"><span data-mce-type="bookmark" style="display: inline-block; width: 0px; overflow: hidden; line-height: 0;" class="mce_SELRES_start">x</span></iframe>'; -->

    