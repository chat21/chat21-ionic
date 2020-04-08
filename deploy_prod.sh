npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

URL_VER=${version//[.]//}
echo 'URL_VER: ---->'$URL_VER

if [ "$version" != "" ]; then
    git tag -a "v$version" -m "`git log -1 --format=%s`"
    echo "Created a new tag, v$version"
    git push --tags
    npm publish
fi

# environment=$(< src/utils/constants.ts)
# start="CURR_VER_PROD = '"
# two="."
# end="'"

# str=${environment#*$start}
# ver=${str%%$two*}
# str=${str#*$two}
# build=${str%%$end*}
# echo 'ver: ---->'$ver
# echo 'build: ---->'$build

# newbuild=$(echo "$build + 1" | bc)
# if (( $newbuild == 1000 )); then
#     NEW_VER=$(echo "$ver + 1" | bc)
#     NEW_BUILD=$(printf "%03d" 0)
# else
#     NEW_VER=$ver
#     NEW_BUILD=$(printf "%03d" $newbuild)
# fi
# echo 'ver: ---->'$NEW_VER
# echo 'build: ---->'$NEW_BUILD

# sed -i -e "s/$start$ver.$build/$start$NEW_VER.$NEW_BUILD/g" src/utils/constants.ts
sed -i -e "s/$URL_VER/g" src/utils/constants.ts
ionic cordova platform add browser --save
ionic cordova build --env=prod browser 
cp -p src/firebase-messaging-sw.js platforms/browser/www/
cp -p src/manifest.json platforms/browser/www/
cp -p src/firebase-config.json platforms/browser/www/

cd platforms/browser/www
#aws s3 sync . s3://tiledesk-dashboard/chat/
aws s3 sync . s3://tiledesk-console/v2/chat/
cd ../../../
aws cloudfront create-invalidation --distribution-id E2DTAKWHWQ7C3J --paths "/*"

# echo new version deployed on s3://tiledesk-dashboard/chat/$NEW_BUILD/
echo new version deployed on s3://tiledesk-console/v2/chat/$URL_VER/
echo available on https://console.tiledesk.com/v2/chat/index.html
