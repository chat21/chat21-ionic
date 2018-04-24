environment=$(< src/utils/constants.ts)
start="BUILD = '"
end="'"
one=${environment#*$start}
build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
NEW_BUILD=$(($build + 1))

# ng build --prod --base-href /$NEW_BUILD/
ionic cordova platform add browser --save
#ionic cordova build browser --prod
ionic cordova build browser
cd platforms/browser/www
aws s3 sync . s3://tiledesk-dashboard/web/dev/0/$NEW_BUILD/
cd ../../../
sed -i -e "s/$start$build/$start$NEW_BUILD/g" src/utils/constants.ts

echo new version deployed on s3://tiledesk-dashboard/web/dev/0/$NEW_BUILD/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-dashboard/web/dev/0/$NEW_BUILD/index.html
