##  Convert the time column in the csv file to YYYYmmDD_HHMMSS, consistent among all mission files

import pandas as pd
from datetime import datetime


###############################

missionFile = 'PD2014.csv'
fmt = '%Y-%m-%d %H:%M:%S'
# fmt = '%a %b %d %H:%M:%S %Y MT'

###############################


data = pd.read_csv(missionFile)
dates = []
for row in data.iterrows():
    # dates.append( datetime.strptime(row[1]['time'], fmt).strftime('%Y%m%d_%H%M%S') )
    dates.append( datetime.utcfromtimestamp(row[1]['time']).strftime('%Y%m%d_%H%M%S') )

data['time'] = pd.Series(dates)
data.to_csv("new"+missionFile, index=False)
