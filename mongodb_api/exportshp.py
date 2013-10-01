# #http://gis.stackexchange.com/questions/35593/using-the-python-shape-library-pyshp-how-to-convert-csv-file-to-shp


import shapefile as shp
import csv
import sys

#out_file = 'outputSHP/formaAll.shp'
inputCSV = sys.argv[1]
random = sys.argv[2]
iso3 = sys.argv[3]

shpFolder = "FORMA_SHP" + random;
shapefilename = "FORMA_SHP"+random


out_path = 'outputSHP/' +  shpFolder + '/{0}.shp'

systemArgs = sys.argv;
#systemArgs=['ARG','PRY','MDG','AUS','BOL','PER','UNK','PNG','TZA','COD','RWA','ECU','GAB','COG','KEN','COL','UGA','MYS','CMR','VEN','SUR','GUF','CAF','BRN','CIV','NGA','LBR','PHL','GUY','GHA','THA','SLE','GIN','PAN','TGO','IND','CRI','VNM','MMR','KHM','NIC','GTM','MTQ','LAO','MEX','HND','CHN','HTI','BGD','TWN','BTN','NPL']#,'BRA','IDN'

for arg in systemArgs:
    print arg

#Set up blank lists for data
x,y,id_no,date,target=[],[],[],[],[]
UNIQUE_ID,RES,TILEH,TILEV,COL,ROW,LAT,LON,ISO3,PERC_TREE_COVER,ADM_REGION,ECO_REGION,MATT_HANSEN_DEFOR,PROBABILITY,DATE=[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]

#read data from csv file and store in lists
with open(inputCSV, 'rb') as csvfile:
    r = csv.reader(csvfile, delimiter=',')
    for i,row in enumerate(r):
        if i > 0 and row[8] in systemArgs: #skip header
            x.append(float(row[7]))
            y.append(float(row[6]))
            UNIQUE_ID.append(row[0])
            RES.append(row[1])
            TILEH.append(row[2])
            TILEV.append(row[3])
            COL.append(row[4])
            ROW.append(row[5])
            ISO3.append(row[8])
            PERC_TREE_COVER.append(row[9])
            ADM_REGION.append(row[10])
            ECO_REGION.append(row[11])
            MATT_HANSEN_DEFOR.append(row[12])
            PROBABILITY.append(row[13])
            DATE.append(row[14])

#systemArgs.append("ALL")

#Set up shapefile writer and create empty fields

w = shp.Writer(shp.POINT)
w.autoBalance = 1 #ensures gemoetry and attributes match
w.field('X','F',10,8)
w.field('Y','F',10,8)
w.field('UNIQUE_ID','C')
w.field('RES','N')
w.field('TILEH','N')
w.field('TILEV','N')
w.field('COL','N')
w.field('ROW','N')
w.field('ISO3','C')
w.field('PERC_TREE_COVER','N')
w.field('ADM_REGION','N')
w.field('ECO_REGION','N')
w.field('MATT_HANSEN_DEFOR','N')
w.field('PROBABILITY','N')
w.field('DATE','D')

#C is ASCII characters
#N is a double precision integer limited to around 18 characters in length
#D is for dates in the YYYYMMDD format, with no spaces or hyphens between the sections.
#F is for floating point numbers with the same length limits as N
#L is for logical data which is stored in the shapefile's attribute table as a short integer as a 1 (true) or a 0 (false). The values it can receive are 1, 0, y, n, Y, N, T, F or the python builtins True and False

#validCountries.append("ALL")

#loop through the data and write the shapefile
for j,k in enumerate(x):
    w.point(k,y[j]) #write the geometry
    w.record(k,y[j],UNIQUE_ID[j], RES[j], TILEH[j], TILEV[j], COL[j], ROW[j], ISO3[j], PERC_TREE_COVER[j], ADM_REGION[j], ECO_REGION[j], MATT_HANSEN_DEFOR[j], PROBABILITY[j], DATE[j]) #write the attributes
       

w.save(out_path.format(shapefilename))
