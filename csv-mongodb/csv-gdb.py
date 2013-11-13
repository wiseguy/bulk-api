import arcpy, os, glob, string, csv

# fc is a point feature class
#
fc = "d:/temp/forma_temp/fgdb/arcpytest.gdb/ALL_COUNTRIES"
cursor = arcpy.da.InsertCursor(fc, ["SHAPE@XY","UNIQUE_ID_STR","RES","TILEH","TILEV","COL","ROW","LAT","LON","ISO3","PERC_TREE_COVER","ADM_REGION","ECO_REGION","MATT_HANSEN_DEFOR","PROBABILITY","DATE_RECORDED","DATE_INDEX"])



i=0
with open('d:/temp/forma_temp/formaAll_2013-10-24_600.csv', 'rU') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='|', escapechar='\\')

    for row in reader:
        #print ', '.join(row)
        print str(len(row)) + " columns"
        print row            
        
        if i>0:
            xy = (float(row[8]), float(row[7]))                      
            k = 0
            cursor.insertRow([xy,row[0],long(row[2]),int(row[3]),int(row[4]),int(row[5]),int(row[6]),float(row[7]),float(row[8]),row[9],int(row[10]),int(row[11]),int(row[12]),int(row[13]),int(row[14]),row[15],int(row[16])])           

        i = i + 1

    reader.close()

   
del cursor

print "Done"