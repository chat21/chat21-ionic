# environment=$(< src/utils/constants.ts)
# start="CURR_VER_PROD = '0."
# end="'"
# one=${environment#*$start}
# build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
# NEW_BUILD=$(($build + 1))
# sed -i -e "s/$start$build/$start$NEW_BUILD/g" src/utils/constants.ts

#npm version prerelease --preid=beta
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

URL_VER=${version//[.]//}
echo 'URL_VER: ---->'$URL_VER

# if [ "$version" != "" ]; then
#     git tag -a "v$version" -m "`git log -1 --format=%s`"
#     echo "Created a new tag, v$version"
#     git push --tags
#     npm publish
# fi

sed -i -e "s/$URL_VER/g" src/utils/constants.ts

# ng build --prod --base-href /$NEW_BUILD/
#ionic cordova build browser --prod

ionic cordova platform add browser --save
#ionic cordova build browser --prod --release
ionic cordova build --env=pre browser --prod  --verbose

cp -p src/firebase-messaging-sw.js platforms/browser/www/
cp -p src/manifest.json platforms/browser/www/
cp -p src/chat-config.json platforms/browser/www/

cd platforms/browser/www
#aws s3 sync . s3://tiledesk-dashboard-pre/chat-ionic5/$version/
cd ../../../

#aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"

echo new version deployed on s3://tiledesk-dashboard-pre/chat-ionic5/$version/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard-pre/chat-ionic5/$version/index.html