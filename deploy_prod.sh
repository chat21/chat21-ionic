npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

URL_VER=${version//[.]//}
echo 'URL_VER: ---->'$URL_VER

# if [ "$version" != "" ]; then
#     git tag -a "$version" -m "`git log -1 --format=%s`"
#     echo "Created a new tag, $version"
#     git push --tags
#     npm publish
# fi

# sed -i -e "s/$start$ver.$build/$start$NEW_VER.$NEW_BUILD/g" src/utils/constants.ts
sed -i -e "s/$URL_VER/g" src/utils/constants.ts
ionic cordova platform add browser --save
#ionic cordova build --env=prod browser  -- --base-href /www/ --prod
ionic cordova build --env=prod browser --prod 
cp -p src/firebase-messaging-sw.js platforms/browser/www/
cp -p src/manifest.json platforms/browser/www/
cp -p src/chat-config.json platforms/browser/www/

cd platforms/browser/www
#aws s3 sync . s3://tiledesk-dashboard/chat/
aws s3 sync . s3://tiledesk-console/v2/chat-ionic5/
aws s3 sync . s3://tiledesk-console/v2/chat-ionic5/$version/
cd ../../../
# aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"

# echo new version deployed on s3://tiledesk-dashboard/chat/$NEW_BUILD/
echo new version deployed on s3://tiledesk-console/v2/chat-ionic5/$version/
echo available on https://console.tiledesk.com/v2/chat-ionic5/$version/index.html
