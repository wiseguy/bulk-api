import arcpy, os, glob, string, csv, datetime
from arcpy import env
starttime = datetime.datetime.now()

out_path = "d:/temp/forma_temp/fgdb"
fgdbName = "ALL_COUNTRIES.gdb"
fcName = "ALL_COUNTRIES"
csvToRead = "d:/temp/forma_temp/formaAll_2013-10-24_600.csv"


arcpy.CreateFileGDB_management(out_path, fgdbName)

env.workspace = out_path + "/" + fgdbName
sr = arcpy.SpatialReference(4326)
arcpy.CreateFeatureclass_management(env.workspace, fcName, "POINT", "", "DISABLED", "DISABLED", sr)
arcpy.AddField_management("ALL_COUNTRIES", "UNIQUE_ID_STR", "STRING", 50, "", "", "UNIQUE_ID_STR", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "UNIQUE_ID", "STRING", 50, "", "", "UNIQUE_ID", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "RES", "SHORT", 10, "", "", "RES", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "TILEH", "SHORT", 10, "", "", "TILEH", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "TILEV", "SHORT", 10, "", "", "TILEV", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "ROW", "SHORT", 10, "", "", "ROW", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "LAT", "FLOAT", 20, "", "", "LAT", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "LON", "FLOAT", 20, "", "", "LON", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "ISO3", "STRING", 5, "", "", "ISO3", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "PERC_TREE_COVER", "SHORT", 10, "", "", "PERC_TREE_COVER", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "ADM_REGION", "LONG", 10, "", "", "ADM_REGION", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "ECO_REGION", "LONG", 10, "", "", "ECO_REGION", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "MATT_HANSEN_DEFOR", "SHORT", 10, "", "", "MATT_HANSEN_DEFOR", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "PROBABILITY", "SHORT", 10, "", "", "PROBABILITY", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "DATE_RECORDED", "DATE", 20, "", "", "DATE_RECORDED", "NULLABLE", "REQUIRED")
arcpy.AddField_management("ALL_COUNTRIES", "DATE_INDEX", "SHORT", 5, "", "", "DATE_INDEX", "NULLABLE", "REQUIRED")

# fc is a point feature class

fc = out_path + "/" + fgdbName + "/" + fcName
cursor = arcpy.da.InsertCursor(fc, ["SHAPE@XY","UNIQUE_ID_STR","UNIQUE_ID","RES","TILEH","TILEV","TILEV","ROW","LAT","LON","ISO3","PERC_TREE_COVER","ADM_REGION","ECO_REGION","MATT_HANSEN_DEFOR","PROBABILITY","DATE_RECORDED","DATE_INDEX"])




i=0

with open(csvToRead, 'rU') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='|', escapechar='\\')

    for row in reader:
        #print ', '.join(row)
        #print str(len(row)) + " columns"
        #print row            
        
        if i>0:
            xy = (float(row[8]), float(row[7]))                      
            k = 0
            cursor.insertRow([xy,row[0],row[1],long(row[2]),int(row[3]),int(row[4]),int(row[5]),int(row[6]),float(row[7]),float(row[8]),row[9],int(row[10]),int(row[11]),int(row[12]),int(row[13]),int(row[14]),row[15],int(row[16])])           

        i = i + 1
        print i   

   
del cursor

endtime = datetime.datetime.now()
print "Started At : " + str(starttime)
print "Ended At : " + str(endtime)
print "Time : " + str(endtime - starttime)


