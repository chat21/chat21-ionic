npm version prerelease --preid=beta
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

sed -i -e "s/$URL_VER/g" src/utils/constants.ts
ionic cordova platform add browser --save
ionic cordova build browser

cp -p src/firebase-messaging-sw.js platforms/browser/www/
cp -p src/manifest.json platforms/browser/www/
cd platforms/browser/www
aws s3 sync . s3://tiledesk-dashboard/chat/dev/$URL_VER/
cd ../../../

echo new version deployed on s3://tiledesk-dashboard/chat/dev/$URL_VER/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard/chat/dev/$URL_VER/index.html