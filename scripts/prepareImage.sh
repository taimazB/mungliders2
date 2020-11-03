time=$1
depth=$2
model=$3
field=$4
lonMin=$5
lonMax=$6
latMin=$7
latMax=$8
now=$9


dir="models/${model}/${field}/"
dest=public/tmp
fileName=`echo ${model}_${field}_${time}_$(printf %04d ${depth})`

if [[ `bc -l <<< "${lonMax}>180"` -eq 1 ]]; then
    lonMax=`bc -l <<< "${lonMax}-360"`
fi
if [[ `bc -l <<< "${lonMin}<-180"` -eq 1 ]]; then
    lonMin=`bc -l <<< "${lonMin}+360"`
fi

export width=`identify -format "%[fx:w]" public/${dir}/jpg/${fileName}.jpg`
export height=`identify -format "%[fx:h]" public/${dir}/jpg/${fileName}.jpg`

export R=6378137.
export PI=3.14159265


function lon2x {
    lon=$1
    bc -l <<< "scale=20; (${R}*${lon}*${PI}/180.)"
}

function lat2y {
    lat=$1
    bc -l <<< "scale=20; (${R} * l( s(${PI}/4 + ${lat}*${PI}/180/2) / c(${PI}/4 + ${lat}*${PI}/180/2)))"
}


yMin=`echo "scale=4; ${height} * (1 - ($(lat2y ${latMax}) + $(lat2y 80)) / (2*$(lat2y 80)))" | bc`  ## y coordinate reveresed
yMax=`echo "scale=4; ${height} * (1 - ($(lat2y ${latMin}) + $(lat2y 80)) / (2*$(lat2y 80)))" | bc`  ## ...
dy=`echo "scale=0; ${yMax}-${yMin}" | bc`


if [[ `bc -l <<< "${lonMax}>${lonMin}"` -eq 1 ]]; then
    xMin=`echo "scale=4; ($(lon2x ${lonMin}) + $(lon2x 179.999)) * ${width} / (2*$(lon2x 179.99))" | bc`
    xMax=`echo "scale=4; ($(lon2x ${lonMax}) + $(lon2x 179.999)) * ${width} / (2*$(lon2x 179.99))" | bc`
    dx=`echo "scale=0; ${xMax}-${xMin}" | bc`
    convert -crop ${dx}x${dy}+${xMin}+${yMin} public/${dir}/jpg/${fileName}.jpg ${dest}/${now}.png
else
    xMin=`echo "scale=4; ($(lon2x ${lonMin}) + $(lon2x 179.999)) * ${width} / (2*$(lon2x 179.99))" | bc`
    xMax=`echo "scale=4; ($(lon2x ${lonMax}) + $(lon2x 179.999)) * ${width} / (2*$(lon2x 179.99))" | bc`
    dx1=`bc -l <<< "scale=0; ${width}-${xMin}"`
    dx2=${xMax}
    dx=$((dx1+dx2))
    convert -crop ${dx1}x${dy}+${xMin}+${yMin} public/${dir}/jpg/${fileName}.jpg ${dest}/${now}_1.png
    convert -crop ${dx2}x${dy}+0+${yMin} public/${dir}/jpg/${fileName}.jpg ${dest}/${now}_2.png
    convert +append ${dest}/${now}_1.png ${dest}/${now}_2.png ${dest}/${now}.png
fi


##  Create json file
width=`identify -format "%[fx:w]" ${dest}/${now}.png`
height=`identify -format "%[fx:h]" ${dest}/${now}.png`
sed "s/\"width\":.*/\"width\": ${width},/ ; s/\"height\":.*/\"height\": ${height},/" public/${dir}/json/${model}_${field}.json > ${dest}/${now}.json
