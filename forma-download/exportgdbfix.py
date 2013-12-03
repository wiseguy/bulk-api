import arcpy, os, glob, string, csv, datetime, sys, gc
from arcpy import env
starttime = datetime.datetime.now()

workingDir = sys.argv[1]
inputCSV = sys.argv[2]
random = sys.argv[3]
iso3 = sys.argv[4]

gdbFolder = "FORMA_GDB" + random;
out_path = workingDir + "//outputFGDB//" + gdbFolder
fgdbName = "FORMA_OUTPUT"+random+".gdb"
fcName = iso3
#csvToRead = "d:/temp/forma_temp/formaAll_2013-10-24_600.csv"


arcpy.CreateFileGDB_management(out_path, fgdbName)

env.workspace = out_path + "/" + fgdbName
sr = arcpy.SpatialReference(4326)
arcpy.CreateFeatureclass_management(env.workspace, fcName, "POINT", "", "DISABLED", "DISABLED", sr)
#arcpy.AddField_management(fcName, "UNIQUE_ID_STR", "STRING", 50, "", "", "UNIQUE_ID_STR", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "UNIQUE_ID", "STRING", 50, "", "", "UNIQUE_ID", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "RES", "SHORT", 10, "", "", "RES", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "TILEH", "SHORT", 10, "", "", "TILEH", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "TILEV", "SHORT", 10, "", "", "TILEV", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "ROW", "SHORT", 10, "", "", "ROW", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "LAT", "FLOAT", 20, "", "", "LAT", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "LON", "FLOAT", 20, "", "", "LON", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "ISO3", "STRING", 5, "", "", "ISO3", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "PERC_TREE_COVER", "SHORT", 10, "", "", "PERC_TREE_COVER", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "ADM_REGION", "LONG", 10, "", "", "ADM_REGION", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "ECO_REGION", "LONG", 10, "", "", "ECO_REGION", "NULLABLE", "REQUIRED")
#arcpy.AddField_management(fcName, "MATT_HANSEN_DEFOR", "SHORT", 10, "", "", "MATT_HANSEN_DEFOR", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "PROBABILITY", "SHORT", 10, "", "", "PROBABILITY", "NULLABLE", "REQUIRED")
arcpy.AddField_management(fcName, "DATE_RECORDED", "DATE", 20, "", "", "DATE_RECORDED", "NULLABLE", "REQUIRED")
#arcpy.AddField_management(fcName, "DATE_INDEX", "SHORT", 5, "", "", "DATE_INDEX", "NULLABLE", "REQUIRED")

# fc is a point feature class

fc = out_path + "/" + fgdbName + "/" + fcName
cursor = arcpy.da.InsertCursor(fc, ["SHAPE@XY","UNIQUE_ID","RES","TILEH","TILEV","TILEV","ROW","LAT","LON","ISO3","PERC_TREE_COVER","ADM_REGION","ECO_REGION","PROBABILITY","DATE_RECORDED"])





i=0

with open(inputCSV, 'rU') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='|', escapechar='\\')

    for row in reader:
        #print ', '.join(row)
        #print str(len(row)) + " columns"
        #print row            
        
        if i>0:
            xy = (float(row[7]), float(row[6]))                      
            k = 0
            cursor.insertRow([xy,row[0],int(row[1]),int(row[2]),int(row[3]),int(row[4]),int(row[5]),float(row[6]),float(row[7]),row[8],int(row[9]),int(row[10]),int(row[11]),int(row[12]),row[13]])           

        i = i + 1
        #print i   

   
del cursor

gc.collect()

endtime = datetime.datetime.now()
print "Started At : " + str(starttime)
print "Ended At : " + str(endtime)
print "Time : " + str(endtime - starttime)


