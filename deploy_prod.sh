environment=$(< src/utils/constants.ts)
start="CURR_VER_PROD = '0."
end="'"
one=${environment#*$start}
build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
NEW_BUILD=$(($build + 1))
sed -i -e "s/$start$build/$start$NEW_BUILD/g" src/utils/constants.ts
# ng build --prod --base-href /$NEW_BUILD/
#ionic cordova build browser --prod

ionic cordova platform add browser --save
ionic cordova build browser

cp -p src/firebase-messaging-sw.js platforms/browser/www/
cp -p src/manifest.json platforms/browser/www/

cd platforms/browser/www
aws s3 sync . s3://tiledesk-dashboard/chat/
cd ../../../

aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"

echo new version deployed on s3://tiledesk-dashboard/chat/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard/chat/index.html
