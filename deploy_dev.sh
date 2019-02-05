


# npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

URL_VER=${version//[.]//}
echo 'URL_VER: ---->'$URL_VER

if [ "$version" != "" ]; then
    git tag -a "v$version" -m "`git log -1 --format=%s`"
    echo "Created a new tag, v$version"
    git push --tags
    # npm publish
    npm publish --tag RC
fi

# environment=$(< src/utils/constants.ts)
# start="CURR_VER_DEV = '"
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
ionic cordova build browser

cp -p src/firebase-messaging-sw.js platforms/browser/www/
cp -p src/manifest.json platforms/browser/www/
cd platforms/browser/www
# aws s3 sync . s3://tiledesk-dashboard/chat/dev/$NEW_VER/$NEW_BUILD/
aws s3 sync . s3://tiledesk-dashboard/chat/dev/$URL_VER/
cd ../../../

echo new version deployed on s3://tiledesk-dashboard/chat/dev/$URL_VER/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard/chat/dev/$URL_VER/index.html
# echo new version deployed on s3://tiledesk-dashboard/chat/dev/$NEW_VER/$NEW_BUILD/
# echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard/chat/dev/$NEW_VER/$NEW_BUILD/index.html
