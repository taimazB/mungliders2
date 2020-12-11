HERE=${HOME}/Projects/mungliders/web/


cd ${HERE}/public/
##  In main.html:
##  Remove lines with '\./js/'
##  Add:  <script src="./js/scripts.js"></script>


cd ${HERE}/public/js/
> scripts_tmp
##  All js files MUST end with ';'
> scripts_tmp
for f in globals.js tools.js initialize.js current/wind-gl.js current/current.js contour/contourf.js bathymetry.js main.js gauge.js pathPlanning.js missions.js; do
    cat $f >> scripts_tmp
done
uglifyjs scripts_tmp -c -m -e > scripts.js
rm scripts_tmp
