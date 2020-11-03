# mainDir=${HOME}/mungliders
mainDir=${HOME}/Projects/mungliders

id=$1
runDir=${mainDir}/gnt/sessions/${id}
ln -s ${mainDir}/gnt/gnt-toolbox/run_path_planning_web.py ${runDir}
ln -s ${mainDir}/gnt/gnt-toolbox/gnt_core_source/build/gnt_linux ${runDir}

cd ${runDir}
mkdir forecasts  ##  In case time stepping is eneabled
input=($(cat inputRaw.txt))
fromLatLon=(${input[0]} ${input[1]})
toLatLon=(${input[2]} ${input[3]})
fModel=${input[4]} ## Forecast Model
hModel=${input[5]} ## Hindcast Model
weight=${input[6]} ## Forcast/hindcast weight
bathymetry=${input[7]} ## Bathymetry switch
timeStepping=${input[8]} ## Time stepping switch

echo "x_start_lat,x_start_lon,x_dest_lat,x_dest_lon,x_fmodel,x_hmodel,x_weight,x_bathymetry,timeStepping" > input.csv
echo "${fromLatLon[0]},${fromLatLon[1]},${toLatLon[0]},${toLatLon[1]},${fModel},${hModel},${weight},${bathymetry},${timeStepping}" >> input.csv
python3 run_path_planning_web.py


# if [[ ${HOSTNAME} == "tuvaq" ]]; then
#     ssh data-process@hotseals-data.physics <<EOF3
# cd gnt-toolbox
# echo "x_start_lat,x_start_lon,x_dest_lat,x_dest_lon,x_fmodel,x_hmodel,x_weight" > inputs/input.csv
# echo "${fromLatLon[0]},${fromLatLon[1]},${toLatLon[0]},${toLatLon[1]},${fModel},${hModel},${weight}" >> inputs/input.csv
# python3 run_path_planning_web.py
# EOF3

# elif [[ ${HOSTNAME} == "hotseals-3d" ]]; then
#     sshpass -p 'Gate9_apt' ssh mungliders@karluk.physics.mun.ca <<EOF1
# ssh data-process@hotseals-data.physics << EOF2

# cd gnt-toolbox
# echo "x_start_lat,x_start_lon,x_dest_lat,x_dest_lon,x_fmodel,x_hmodel,x_weight" > inputs/input.csv
# echo "${fromLatLon[0]},${fromLatLon[1]},${toLatLon[0]},${toLatLon[1]},${fModel},${hModel},${weight}" >> inputs/input.csv
# python3 run_path_planning_web.py
# scp -P 1342 path_waypoints_smooth.csv taimaz@156.57.62.36:Projects/mapBoxNode/outputs/
# scp -P 1342 goto_l20.ma taimaz@156.57.62.36:Projects/mapBoxNode/outputs/
# EOF2
# EOF1

# elif [[ ${HOSTNAME} == "159-203-6-104.plesk.page" ]]; then
#     sshpass -p 'Gate9_apt' ssh mungliders@karluk.physics.mun.ca <<EOF1
# ssh data-process@hotseals-data.physics << EOF2

# cd gnt-toolbox
# echo "x_start_lat,x_start_lon,x_dest_lat,x_dest_lon,x_fmodel,x_hmodel,x_weight" > inputs/input.csv
# echo "${fromLatLon[0]},${fromLatLon[1]},${toLatLon[0]},${toLatLon[1]},${fModel},${hModel},${weight}" >> inputs/input.csv
# python3 run_path_planning_web.py
# scp path_waypoints_smooth.csv taimaz@159.203.6.104:node/outputs/
# scp goto_l20.ma taimaz@159.203.6.104:node/outputs/
# EOF2
# EOF1
# fi
