import multiprocessing, arcpy, os, glob, string, csv, datetime
from arcpy import env
starttime = datetime.datetime.now()

out_path = "d:/temp/forma_temp/fgdb/Countries"
#fgdbName = "ALL_COUNTRIES.gdb"
fcName = "ALL_COUNTRIES"
csvToRead = "d:/temp/forma_temp/formaAll_2013-10-24_600.csv"
countriesCreated = []
cursorDict = {}
numRequests = 6

def create_gdb(fgdbName,fcName):
    arcpy.CreateFileGDB_management(out_path, fgdbName)

    env.workspace = out_path + "/" + fgdbName
    sr = arcpy.SpatialReference(4326)
    arcpy.CreateFeatureclass_management(env.workspace, fcName, "POINT", "", "DISABLED", "DISABLED", sr)
    arcpy.AddField_management(fcName, "UNIQUE_ID_STR", "STRING", 50, "", "", "UNIQUE_ID_STR", "NULLABLE", "REQUIRED")
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
    arcpy.AddField_management(fcName, "MATT_HANSEN_DEFOR", "SHORT", 10, "", "", "MATT_HANSEN_DEFOR", "NULLABLE", "REQUIRED")
    arcpy.AddField_management(fcName, "PROBABILITY", "SHORT", 10, "", "", "PROBABILITY", "NULLABLE", "REQUIRED")
    arcpy.AddField_management(fcName, "DATE_RECORDED", "DATE", 20, "", "", "DATE_RECORDED", "NULLABLE", "REQUIRED")
    arcpy.AddField_management(fcName, "DATE_INDEX", "SHORT", 5, "", "", "DATE_INDEX", "NULLABLE", "REQUIRED")

# fc is a point feature class

#fc = out_path + "/" + fgdbName + "/" + fcName
#cursor = arcpy.da.InsertCursor(fc, ["SHAPE@XY","UNIQUE_ID_STR","UNIQUE_ID","RES","TILEH","TILEV","TILEV","ROW","LAT","LON","ISO3","PERC_TREE_COVER","ADM_REGION","ECO_REGION","MATT_HANSEN_DEFOR","PROBABILITY","DATE_RECORDED","DATE_INDEX"])

i=0

def concurrent_request_worker(row):
    print row[1]
    if iso3 not in countriesCreated:
        countriesCreated.append(iso3)
    xy = (float(row[8]), float(row[7]))
    cursorDict[iso3].insertRow([xy,row[0],row[1],long(row[2]),int(row[3]),int(row[4]),int(row[5]),int(row[6]),float(row[7]),float(row[8]),row[9],int(row[10]),int(row[11]),int(row[12]),int(row[13]),int(row[14]),row[15],int(row[16])]) 

def concurrent_request_complete():   
    print i
    if (i%100000)==0:   
        print str(i) +  " records processed"



with open(csvToRead, 'rU') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='|', escapechar='\\')

    for row in reader:
        #print ', '.join(row)
        #print str(len(row)) + " columns"
        #print row              
        iso3 = row[9]
         
        
        if i>0: #dont pick first row
            if iso3 in countriesCreated:
                print "yes its there"
                pool = multiprocessing.Pool(numRequests)
                print "got here"
                for k in range(0,numRequests,1):
                    arguments = (row,)
                    print "arguments after"
                    pool.apply_async(concurrent_request_worker, arguments, callback=concurrent_request_complete)
                pool.close()
                pool.join()                                                                        
            else:
                create_gdb(iso3 + ".gdb",iso3)
                print "Created Geodatabase for " + iso3
                fc = out_path + "/" + iso3 + ".gdb/" + iso3
                cursorDict[iso3] = arcpy.da.InsertCursor(fc, ["SHAPE@XY","UNIQUE_ID_STR","UNIQUE_ID","RES","TILEH","TILEV","TILEV","ROW","LAT","LON","ISO3","PERC_TREE_COVER","ADM_REGION","ECO_REGION","MATT_HANSEN_DEFOR","PROBABILITY","DATE_RECORDED","DATE_INDEX"])
                countriesCreated.append(iso3)

        i = i + 1

        

   
# del cursorDict

endtime = datetime.datetime.now()
print "Started At : " + str(starttime)
print "Ended At : " + str(endtime)
print "Time : " + str(endtime - starttime)


