import arcpy, os, glob, string, csv, datetime, sys, gc
from arcpy import env
starttime = datetime.datetime.now()

workingDir = sys.argv[1]
inputCSV = sys.argv[2]
random = sys.argv[3]
iso3 = sys.argv[4]



shpFolder = "FORMA_SHP" + random;
out_path = workingDir + "//outputSHP//" + shpFolder
shapefilename = "FORMA_SHP"+random+".shp"
fcName = iso3
#csvToRead = "d:/temp/forma_temp/formaAll_2013-10-24_600.csv"


#arcpy.CreateFileGDB_management(out_path, fgdbName)

env.workspace = out_path
sr = arcpy.SpatialReference(4326)
arcpy.CreateFeatureclass_management(env.workspace, shapefilename, "POINT", "", "DISABLED", "DISABLED", sr)
#arcpy.AddField_management(fcName, "UNIQUE_ID_STR", "STRING", 50)
arcpy.AddField_management(shapefilename, "UNIQUE_ID", "STRING", 50)
arcpy.AddField_management(shapefilename, "RES", "SHORT", 10)
arcpy.AddField_management(shapefilename, "TILEH", "SHORT", 10)
arcpy.AddField_management(shapefilename, "TILEV", "SHORT", 10)
arcpy.AddField_management(shapefilename, "ROW", "SHORT", 10)
arcpy.AddField_management(shapefilename, "LAT", "FLOAT", 20)
arcpy.AddField_management(shapefilename, "LON", "FLOAT", 20)
arcpy.AddField_management(shapefilename, "ISO3", "STRING", 5)
arcpy.AddField_management(shapefilename, "PC_TRE_CVR", "SHORT", 10)
arcpy.AddField_management(shapefilename, "ADM_REG", "LONG", 10)
arcpy.AddField_management(shapefilename, "ECO_REG", "LONG", 10)
#arcpy.AddField_management(fcName, "MATT_HANSEN_DEFOR", "SHORT", 10)
arcpy.AddField_management(shapefilename, "PROB", "SHORT", 10)
arcpy.AddField_management(shapefilename, "DATE_REC", "DATE", 20)
arcpy.AddField_management(fcName, "DATE_INDEX", "SHORT", 5)

# fc is a point feature class

fc = out_path + "/" + shapefilename
cursor = arcpy.da.InsertCursor(fc, ["SHAPE@XY","UNIQUE_ID","RES","TILEH","TILEV","TILEV","ROW","LAT","LON","ISO3","PC_TRE_CVR","ADM_REG","ECO_REG","PROB","DATE_REC","DATE_INDEX"])





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
            try:
                cursor.insertRow([xy,row[0],int(row[1]),int(row[2]),int(row[3]),int(row[4]),int(row[5]),float(row[6]),float(row[7]),row[8],int(row[9]),int(row[10]),int(row[11]),int(row[12]),row[14],int(row[13])])           
            except:
                break
        i = i + 1
        #print i   

   
del cursor
print "finished"
gc.collect()

endtime = datetime.datetime.now()
print "Started At : " + str(starttime)
print "Ended At : " + str(endtime)
print "Time : " + str(endtime - starttime)


