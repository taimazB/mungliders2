###########################################--------###########################################
##----------------------------------------- ENCODE -----------------------------------------##
HERE=${HOME}/Projects/mungliders/web/


cd ${HERE}/public/js/
> tmp
for f in globals.js tools.js initialize.js current/wind-gl.js current/current.js contour/contourf.js bathymetry.js main.js gauge.js pathPlanning.js missions.js; do
    cat $f >> tmp
done
uglifyjs tmp -m reserved=["mapDistanceLinearClick","mapDistanceLinearMove"] -e > ../scripts.js
rm tmp


##  In mainMapPage.html:
##  Remove lines with '\./js/'
##  Add:  <script src="./scripts.js"></script>
cd ${HERE}/public/
mv mainMapPage.html mainMapPage.html.b
sed '/\.\/js\//d' mainMapPage.html.b  | sed '/<!-- SCRIPTS -->/a <script src="./scripts.js"></script>' > mainMapPage.html


###########################################--------###########################################
##----------------------------------------- UPLOAD -----------------------------------------##
cd ${HERE}
DO=taimaz@159.203.6.104

rsync -aruvz --exclude-from='.exclude' --delete . ${DO}:web

cd ${HERE}/public
mv mainMapPage.html.b mainMapPage.html
rm ${HERE}/public/scripts.js
